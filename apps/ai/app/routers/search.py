import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import SearchRerankRequest, SearchRerankResponse
from app.services.recommendation_service import recommendation_service

logger = logging.getLogger(__name__)

router = APIRouter(tags=["search"])


@router.post("/search-rerank", response_model=SearchRerankResponse)
async def search_rerank(request: SearchRerankRequest):
    """Rerank search results using semantic similarity and user context."""
    try:
        reranked_ids, scores = recommendation_service.search_rerank(
            query=request.query,
            product_ids=request.product_ids,
            user_id=request.user_id,
            limit=request.limit,
        )

        return SearchRerankResponse(
            query=request.query,
            reranked_ids=reranked_ids,
            scores=scores,
        )
    except Exception as e:
        logger.error("Search rerank error: %s", e)
        raise HTTPException(
            status_code=500,
            detail="Failed to rerank search results",
        ) from e
