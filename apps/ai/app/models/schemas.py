from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    limit: int = Field(default=20, ge=1, le=100)
    context: dict | None = None


class RecommendedProduct(BaseModel):
    product_id: str
    score: float
    reason: str
    strategy: str


class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: list[RecommendedProduct]
    strategy: str
    cached: bool = False


class SimilarProductsResponse(BaseModel):
    product_id: str
    recommendations: list[RecommendedProduct]


class SearchRerankRequest(BaseModel):
    query: str
    product_ids: list[str]
    user_id: str | None = None
    limit: int = Field(default=20, ge=1, le=100)


class SearchRerankResponse(BaseModel):
    query: str
    reranked_ids: list[str]
    scores: list[float]


class EmbeddingRequest(BaseModel):
    product_id: str
    text: str


class EmbeddingResponse(BaseModel):
    product_id: str
    dimensions: int
    model: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
