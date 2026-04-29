import logging

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import SimilarProductsResponse
from app.services.recommendation_service import recommendation_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["similar-products"])


@router.get(
    "/similar-products/{product_id}",
    response_model=SimilarProductsResponse,
)
async def get_similar_products(
    product_id: str,
    limit: int = Query(default=10, ge=1, le=50),
):
    """Find products similar to the given product."""
    try:
        recommendations = recommendation_service.similar_products(
            product_id=product_id,
            limit=limit,
        )

        return SimilarProductsResponse(
            product_id=product_id,
            recommendations=recommendations,
        )
    except Exception as e:
        logger.error(
            "Similar products error for %s: %s", product_id, e
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to find similar products",
        ) from e
