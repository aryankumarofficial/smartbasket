import json
import logging
from typing import Any, Dict, Optional

import numpy as np

from app.models.schemas import RecommendedProduct
from app.services.embedding_service import embedding_service
from app.utils.database import (
    fetch_product_by_id,
    fetch_similar_products_by_vector,
    fetch_top_cooccurrence_products,
    fetch_products,
    fetch_user_events,
    fetch_user_profile,
)

logger = logging.getLogger(__name__)


class RecommendationService:
    """Hybrid recommendation engine combining multiple strategies."""

    def recommend(
        self,
        user_id: str,
        limit: int = 20,
        context: Optional[Dict] = None,
    ) -> tuple[list[RecommendedProduct], str]:
        """Generate recommendations for a user.

        Returns (recommendations, strategy_used).
        """
        profile = fetch_user_profile(user_id)
        events = fetch_user_events(user_id, limit=500)

        total_views = profile.get("total_views", 0) if profile else 0

        if total_views < 5:
            # Cold start
            recs = self._cold_start(limit, context)
            return recs, "popular"

        # Warm user: hybrid approach
        recs = self._hybrid_recommend(
            user_id, profile, events, limit, context
        )
        return recs, "hybrid"

    def similar_products(
        self, product_id: str, limit: int = 10
    ) -> list[RecommendedProduct]:
        """Find similar products using embeddings + category matching."""
        product = fetch_product_by_id(product_id)
        if not product:
            return []

        # Try embedding-based similarity
        product_text = embedding_service.build_product_text(product)
        query_embedding = embedding_service.encode(product_text)
        vector_matches = fetch_similar_products_by_vector(
            query_embedding, limit=limit + 1
        )
        vector_recs = self._vector_matches_to_recommendations(
            product_id, vector_matches, limit
        )
        if vector_recs:
            return vector_recs

        # Fallback: category-based
        return self._category_similarity(product, limit)

    def search_rerank(
        self,
        query: str,
        product_ids: list[str],
        user_id: Optional[str] = None,
        limit: int = 20,
    ) -> tuple[list[str], list[float]]:
        """Rerank search results using semantic similarity."""
        query_embedding = embedding_service.encode(query)

        products = fetch_products(limit=1000)
        product_map = {str(p["id"]): p for p in products}

        scored: list[tuple[str, float]] = []
        for pid in product_ids:
            p = product_map.get(pid)
            if not p:
                continue

            text = embedding_service.build_product_text(p)
            product_embedding = embedding_service.encode(text)
            sim = embedding_service.cosine_similarity(
                query_embedding, product_embedding
            )

            # Boost by rating
            rating = float(p.get("rating") or 0)
            score = sim * 0.7 + (rating / 5.0) * 0.3

            scored.append((pid, score))

        scored.sort(key=lambda x: x[1], reverse=True)
        scored = scored[:limit]

        return [s[0] for s in scored], [s[1] for s in scored]

    def _cold_start(
        self, limit: int, context: Optional[Dict] = None
    ) -> list[RecommendedProduct]:
        """Popular + rule-based recommendations for new users."""
        products = fetch_products(limit=200)

        scored: list[tuple[dict, float]] = []
        for p in products:
            score = 0.0

            # Rating boost
            rating = float(p.get("rating") or 0)
            score += rating * 2

            # Review count boost (popularity)
            reviews = int(p.get("review_count") or 0)
            score += min(reviews / 100, 2.0)

            # Context matching
            if context:
                score += self._context_score(p, context)

            scored.append((p, score))

        scored.sort(key=lambda x: x[1], reverse=True)

        return [
            RecommendedProduct(
                product_id=str(p["id"]),
                score=round(s, 3),
                reason="Popular and highly rated",
                strategy="popular",
            )
            for p, s in scored[:limit]
        ]

    def _hybrid_recommend(
        self,
        user_id: str,
        profile: Optional[dict],
        events: list[dict],
        limit: int,
        context: Optional[Dict] = None,
    ) -> list[RecommendedProduct]:
        """Combine content-based, collaborative, and rule-based signals."""
        products = fetch_products(limit=500)
        collaborative_candidates = fetch_top_cooccurrence_products(
            user_id, limit=200
        )
        collaborative_map = {
            str(item["product_id"]): float(item["score"])
            for item in collaborative_candidates
            if item.get("product_id")
        }

        # Products user has already interacted with
        interacted_ids = set()
        for e in events:
            if e.get("product_id"):
                interacted_ids.add(str(e["product_id"]))

        candidates = [
            p for p in products if str(p["id"]) not in interacted_ids
        ]

        scored: list[tuple[dict, float, str]] = []
        for p in candidates:
            score = 0.0
            reasons: list[str] = []

            # 1. Category affinity (content-based)
            if profile and profile.get("category_affinities"):
                affinities = profile["category_affinities"]
                if isinstance(affinities, str):
                    affinities = json.loads(affinities)
                cat_score = float(affinities.get(p["category"], 0))
                score += cat_score * 3
                if cat_score > 0.3:
                    reasons.append(
                        f"Matches your interest in {p['category']}"
                    )

            # 2. Price fit
            if profile and profile.get("preferred_price_range"):
                pr = profile["preferred_price_range"]
                if isinstance(pr, str):
                    pr = json.loads(pr)
                price = float(p.get("price") or 0)
                if pr.get("min", 0) <= price <= pr.get("max", 99999):
                    score += 2
                    reasons.append("Within your price range")

            # 3. Occasion match
            if profile and profile.get("top_occasions"):
                occ = profile["top_occasions"]
                if isinstance(occ, str):
                    occ = json.loads(occ)
                product_occasions = p.get("occasions") or []
                if isinstance(product_occasions, str):
                    product_occasions = json.loads(product_occasions)
                for o in occ[:3]:
                    occ_name = o.get("occasion", "") if isinstance(o, dict) else str(o)
                    if occ_name in product_occasions:
                        score += 4
                        reasons.append(f"Great for {occ_name}")
                        break

            # 4. Rating boost
            rating = float(p.get("rating") or 0)
            score += rating * 0.5

            # 5. Recency boost
            score += 1  # base score for availability

            # 6. Collaborative boost
            cooccurrence = collaborative_map.get(str(p["id"]), 0.0)
            if cooccurrence > 0:
                score += min(cooccurrence, 5.0)
                reasons.append("Users with similar behavior liked this")

            # 7. Context matching
            if context:
                ctx_score = self._context_score(p, context)
                score += ctx_score

            reason = reasons[0] if reasons else "Recommended for you"
            scored.append((p, score, reason))

        scored.sort(key=lambda x: x[1], reverse=True)

        return [
            RecommendedProduct(
                product_id=str(p["id"]),
                score=round(s, 3),
                reason=reason,
                strategy="hybrid",
            )
            for p, s, reason in scored[:limit]
        ]

    def _context_score(self, product: dict, context: dict) -> float:
        """Score product against request context."""
        score = 0.0

        if context.get("occasion"):
            occasions = product.get("occasions") or []
            if isinstance(occasions, str):
                occasions = json.loads(occasions)
            if context["occasion"] in occasions:
                score += 4

        if context.get("recipientType"):
            recipients = product.get("recipient_types") or []
            if isinstance(recipients, str):
                recipients = json.loads(recipients)
            if context["recipientType"] in recipients:
                score += 3

        if context.get("budget"):
            price = float(product.get("price") or 0)
            budget = context["budget"]
            if isinstance(budget, dict):
                if budget.get("min", 0) <= price <= budget.get(
                    "max", 99999
                ):
                    score += 2

        if context.get("category"):
            if product.get("category") == context["category"]:
                score += 3

        return score

    def _vector_matches_to_recommendations(
        self, product_id: str, vector_matches: list[dict], limit: int
    ) -> list[RecommendedProduct]:
        filtered = [
            row
            for row in vector_matches
            if str(row["product_id"]) != str(product_id)
        ][:limit]
        return [
            RecommendedProduct(
                product_id=str(row["product_id"]),
                score=round(float(row["score"]), 3),
                reason="Similar product",
                strategy="content_based",
            )
            for row in filtered
        ]

    def _category_similarity(
        self, product: dict, limit: int
    ) -> list[RecommendedProduct]:
        """Fallback: find products in the same category."""
        products = fetch_products(limit=200)

        same_category = [
            p
            for p in products
            if p["category"] == product["category"]
            and str(p["id"]) != str(product["id"])
        ]

        return [
            RecommendedProduct(
                product_id=str(p["id"]),
                score=round(1.0 - i * 0.05, 3),
                reason=f"Similar to {product.get('name', 'this product')}",
                strategy="content_based",
            )
            for i, p in enumerate(same_category[:limit])
        ]


recommendation_service = RecommendationService()
