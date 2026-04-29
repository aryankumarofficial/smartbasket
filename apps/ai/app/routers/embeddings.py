import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import EmbeddingRequest, EmbeddingResponse
from app.services.embedding_service import embedding_service
from app.utils.database import (
    fetch_product_by_id,
    fetch_products,
    save_product_embedding,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/embeddings", tags=["embeddings"])


@router.post("/product", response_model=EmbeddingResponse)
async def generate_product_embedding(request: EmbeddingRequest):
    """Generate and store embedding for a single product."""
    try:
        embedding = embedding_service.encode(request.text)

        save_product_embedding(
            product_id=request.product_id,
            embedding=embedding,
            model=embedding_service.model_name,
            dimensions=embedding_service.dimensions,
            input_text=request.text,
        )

        return EmbeddingResponse(
            product_id=request.product_id,
            dimensions=embedding_service.dimensions,
            model=embedding_service.model_name,
        )
    except Exception as e:
        logger.error("Embedding error for product %s: %s", request.product_id, e)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate embedding",
        ) from e


@router.post("/products/batch")
async def generate_batch_embeddings():
    """Generate embeddings for all products that don't have one yet."""
    try:
        products = fetch_products(limit=10000)

        texts = []
        product_ids = []
        for p in products:
            text = embedding_service.build_product_text(p)
            texts.append(text)
            product_ids.append(str(p["id"]))

        if not texts:
            return {"processed": 0}

        embeddings = embedding_service.encode_batch(texts)

        for pid, emb, text in zip(product_ids, embeddings, texts):
            save_product_embedding(
                product_id=pid,
                embedding=emb,
                model=embedding_service.model_name,
                dimensions=embedding_service.dimensions,
                input_text=text,
            )

        return {"processed": len(product_ids)}
    except Exception as e:
        logger.error("Batch embedding error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate batch embeddings",
        ) from e
