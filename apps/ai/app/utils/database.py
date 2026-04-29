import os
from contextlib import contextmanager
from typing import Generator

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")


def get_connection():
    """Create a new database connection."""
    return psycopg2.connect(DATABASE_URL)


@contextmanager
def get_cursor() -> Generator:
    """Context manager for database cursor with auto-commit/rollback."""
    conn = get_connection()
    try:
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        cursor.close()
        conn.close()


def fetch_products(limit: int = 1000) -> list[dict]:
    """Fetch products from database."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT id, name, description, price, category, subcategory,
                   tags, occasions, recipient_types, rating, review_count
            FROM products
            WHERE in_stock = true
            ORDER BY created_at DESC
            LIMIT %s
            """,
            (limit,),
        )
        return cur.fetchall()


def fetch_product_by_id(product_id: str) -> dict | None:
    """Fetch a single product by ID."""
    with get_cursor() as cur:
        cur.execute("SELECT * FROM products WHERE id = %s", (product_id,))
        return cur.fetchone()


def fetch_user_events(user_id: str, limit: int = 500) -> list[dict]:
    """Fetch recent user events."""
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT event_type, product_id, metadata, created_at
            FROM user_events
            WHERE user_id = %s
            ORDER BY created_at DESC
            LIMIT %s
            """,
            (user_id, limit),
        )
        return cur.fetchall()


def fetch_user_profile(user_id: str) -> dict | None:
    """Fetch aggregated user profile."""
    with get_cursor() as cur:
        cur.execute(
            "SELECT * FROM user_profiles WHERE user_id = %s", (user_id,)
        )
        return cur.fetchone()


def fetch_product_embeddings() -> list[dict]:
    """Fetch all product embeddings."""
    with get_cursor() as cur:
        cur.execute(
            "SELECT product_id, embedding FROM product_embeddings"
        )
        return cur.fetchall()


def fetch_similar_products_by_vector(
    embedding: list[float], limit: int = 10
) -> list[dict]:
    """Fetch similar products using pgvector cosine distance."""
    vector_literal = "[" + ",".join(str(v) for v in embedding) + "]"
    with get_cursor() as cur:
        cur.execute(
            """
            SELECT product_id, 1 - (embedding <=> %s::vector) AS score
            FROM product_embeddings
            ORDER BY embedding <=> %s::vector
            LIMIT %s
            """,
            (vector_literal, vector_literal, limit),
        )
        return cur.fetchall()


def fetch_top_cooccurrence_products(
    user_id: str, limit: int = 20
) -> list[dict]:
    """Find collaborative candidates from co-view and co-purchase behavior."""
    with get_cursor() as cur:
        cur.execute(
            """
            WITH user_products AS (
              SELECT DISTINCT product_id
              FROM user_events
              WHERE user_id = %s AND product_id IS NOT NULL
            ),
            similar_users AS (
              SELECT DISTINCT ue.user_id
              FROM user_events ue
              JOIN user_products up ON up.product_id = ue.product_id
              WHERE ue.user_id <> %s
              LIMIT 500
            )
            SELECT ue.product_id, COUNT(*) AS score
            FROM user_events ue
            JOIN similar_users su ON su.user_id = ue.user_id
            LEFT JOIN user_products up ON up.product_id = ue.product_id
            WHERE ue.product_id IS NOT NULL AND up.product_id IS NULL
            GROUP BY ue.product_id
            ORDER BY score DESC
            LIMIT %s
            """,
            (user_id, user_id, limit),
        )
        return cur.fetchall()


def save_product_embedding(
    product_id: str,
    embedding: list[float],
    model: str,
    dimensions: int,
    input_text: str,
) -> None:
    """Save or update a product embedding."""
    with get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO product_embeddings
                (product_id, embedding, model, dimensions, input_text)
            VALUES (%s, %s::vector, %s, %s, %s)
            ON CONFLICT (product_id) DO UPDATE SET
                embedding = EXCLUDED.embedding,
                model = EXCLUDED.model,
                dimensions = EXCLUDED.dimensions,
                input_text = EXCLUDED.input_text,
                version = product_embeddings.version + 1,
                updated_at = NOW()
            """,
            (
                product_id,
                "[" + ",".join(str(v) for v in embedding) + "]",
                model,
                dimensions,
                input_text,
            ),
        )
