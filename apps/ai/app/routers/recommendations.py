import logging

from fastapi import APIRouter, HTTPException, Query

from app.models.schemas import (
    RecommendationRequest,
    RecommendationResponse,
    SimilarProductsResponse,
)
from app.services.recommendation_service import recommendation_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommend", tags=["recommendations"])


@router.post("/{user_id}", response_model=RecommendationResponse)
async def get_recommendations(
    user_id: str,
    request: RecommendationRequest,
):
    """Generate personalized recommendations for a user."""
    try:
        recommendations, strategy = recommendation_service.recommend(
            user_id=user_id,
            limit=request.limit,
            context=request.context,
        )

        return RecommendationResponse(
            user_id=user_id,
            recommendations=recommendations,
            strategy=strategy,
        )
    except Exception as e:
        logger.error("Recommendation error for user %s: %s", user_id, e)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate recommendations",
        ) from e


@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_recommendations_get(
    user_id: str,
    limit: int = Query(default=20, ge=1, le=100),
):
    """GET endpoint for recommendations (simpler interface)."""
    try:
        recommendations, strategy = recommendation_service.recommend(
            user_id=user_id,
            limit=limit,
        )

        return RecommendationResponse(
            user_id=user_id,
            recommendations=recommendations,
            strategy=strategy,
        )
    except Exception as e:
        logger.error("Recommendation error for user %s: %s", user_id, e)
        raise HTTPException(
            status_code=500,
            detail="Failed to generate recommendations",
        ) from e
