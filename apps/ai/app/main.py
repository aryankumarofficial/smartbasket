import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.schemas import HealthResponse
from app.routers import embeddings, recommendations, search, similar, tagging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

app = FastAPI(
    title="SmartBasket AI Service",
    description="ML-powered recommendation and search engine for SmartBasket",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(recommendations.router)
app.include_router(similar.router)
app.include_router(search.router)
app.include_router(embeddings.router)
app.include_router(tagging.router)


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    from app.services.embedding_service import embedding_service

    return HealthResponse(
        status="healthy",
        model_loaded=embedding_service._model is not None,
        version="1.0.0",
    )


@app.get("/")
async def root():
    return {
        "service": "SmartBasket AI",
        "version": "1.0.0",
        "endpoints": [
            "/recommend/{user_id}",
            "/similar-products/{product_id}",
            "/search-rerank",
            "/embeddings/product",
            "/embeddings/products/batch",
            "/tagging/product",
            "/health",
        ],
    }
