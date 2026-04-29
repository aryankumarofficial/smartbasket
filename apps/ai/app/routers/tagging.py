import logging

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ProductTag,
    ProductTaggingRequest,
    ProductTaggingResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/tagging", tags=["tagging"])


def infer_price_segment(price: str) -> str:
    try:
        value = float(price)
    except Exception:
        return "mid_range"
    if value < 500:
        return "budget"
    if value > 2500:
        return "premium"
    return "mid_range"


@router.post("/product", response_model=ProductTaggingResponse)
async def generate_product_tags(payload: ProductTaggingRequest):
    try:
        text = f"{payload.title} {payload.description or ''}".lower()
        tags: list[ProductTag] = []

        if "birthday" in text or "anniversary" in text or "festival" in text:
            tags.append(
                ProductTag(tag="birthday", category="use_case", weight=0.75)
            )
        if "men" in text or "male" in text:
            tags.append(ProductTag(tag="men", category="audience", weight=0.7))
        if "women" in text or "female" in text:
            tags.append(
                ProductTag(tag="women", category="audience", weight=0.7)
            )
        if payload.category:
            tags.append(
                ProductTag(
                    tag=payload.category.lower().replace(" ", "_"),
                    category="type",
                    weight=0.65,
                )
            )

        metadata = payload.metadata or {}
        price = str(metadata.get("price", ""))
        tags.append(
            ProductTag(
                tag=infer_price_segment(price),
                category="price_segment",
                weight=0.6,
            )
        )

        deduped: dict[str, ProductTag] = {}
        for tag in tags:
            deduped[f"{tag.category}:{tag.tag}"] = tag
        return ProductTaggingResponse(tags=list(deduped.values()))
    except Exception as exc:
        logger.error("Tagging generation failed: %s", exc)
        raise HTTPException(status_code=500, detail="Tag generation failed") from exc
