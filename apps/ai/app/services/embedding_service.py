import json
import logging

import numpy as np

logger = logging.getLogger(__name__)

MODEL_NAME = "all-MiniLM-L6-v2"


class EmbeddingService:
    """Generates and manages text embeddings for products and users."""

    def __init__(self):
        self._model = None
        self._model_name = MODEL_NAME
        self._dimensions = 384  # MiniLM-L6-v2 output dim

    @property
    def model(self):
        if self._model is None:
            self._load_model()
        return self._model

    @property
    def dimensions(self) -> int:
        return self._dimensions

    @property
    def model_name(self) -> str:
        return self._model_name

    def _load_model(self):
        try:
            from sentence_transformers import SentenceTransformer

            logger.info("Loading embedding model: %s", self._model_name)
            self._model = SentenceTransformer(self._model_name)
            self._dimensions = self._model.get_sentence_embedding_dimension()
            logger.info(
                "Model loaded. Dimensions: %d", self._dimensions
            )
        except ImportError:
            logger.warning(
                "sentence-transformers not installed. Using random embeddings."
            )
            self._model = None

    def encode(self, text: str) -> list[float]:
        """Generate embedding for a single text."""
        if self._model is not None or self._try_load():
            return self.model.encode(text).tolist()
        # Fallback: deterministic hash-based pseudo-embedding
        return self._fallback_encode(text)

    def encode_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embeddings for multiple texts."""
        if self._model is not None or self._try_load():
            return self.model.encode(texts).tolist()
        return [self._fallback_encode(t) for t in texts]

    def _try_load(self) -> bool:
        try:
            self._load_model()
            return self._model is not None
        except Exception:
            return False

    def _fallback_encode(self, text: str) -> list[float]:
        """Deterministic fallback when model unavailable."""
        np.random.seed(hash(text) % (2**32))
        return np.random.randn(self._dimensions).tolist()

    def cosine_similarity(
        self, a: list[float], b: list[float]
    ) -> float:
        """Compute cosine similarity between two vectors."""
        a_arr = np.array(a)
        b_arr = np.array(b)
        dot = np.dot(a_arr, b_arr)
        norm = np.linalg.norm(a_arr) * np.linalg.norm(b_arr)
        if norm == 0:
            return 0.0
        return float(dot / norm)

    def build_product_text(self, product: dict) -> str:
        """Build embedding input text from product attributes."""
        parts = [product.get("name", "")]

        if product.get("description"):
            parts.append(str(product["description"]))

        if product.get("category"):
            parts.append(f"Category: {product['category']}")

        if product.get("subcategory"):
            parts.append(f"Subcategory: {product['subcategory']}")

        tags = product.get("tags")
        if tags:
            if isinstance(tags, str):
                tags = json.loads(tags)
            if isinstance(tags, list):
                parts.append(f"Tags: {', '.join(tags)}")

        occasions = product.get("occasions")
        if occasions:
            if isinstance(occasions, str):
                occasions = json.loads(occasions)
            if isinstance(occasions, list):
                parts.append(f"Occasions: {', '.join(occasions)}")

        recipients = product.get("recipient_types")
        if recipients:
            if isinstance(recipients, str):
                recipients = json.loads(recipients)
            if isinstance(recipients, list):
                parts.append(f"For: {', '.join(recipients)}")

        return " | ".join(parts)


embedding_service = EmbeddingService()
