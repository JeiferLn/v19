from typing import Any

import httpx

from app.core.config import Settings
from app.schemas.product import Product

PRODUCTS_QUERY = """
query Products($first: Int!) {
  products(first: $first) {
    nodes {
      id
      title
      description
      featuredImage { url }
      priceRangeV2 { minVariantPrice { amount currencyCode } }
    }
  }
}
"""


class ShopifyClient:
    """Cliente mínimo de la Admin GraphQL API de Shopify."""

    def __init__(self, settings: Settings) -> None:
        self._url = (
            f"https://{settings.shopify_store_domain}"
            f"/admin/api/{settings.shopify_api_version}/graphql.json"
        )
        self._headers = {"X-Shopify-Access-Token": settings.shopify_access_token}

    async def _query(self, query: str, variables: dict[str, Any] | None = None) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=15) as client:
            res = await client.post(
                self._url,
                json={"query": query, "variables": variables or {}},
                headers=self._headers,
            )
            res.raise_for_status()
            return res.json()["data"]

    async def list_products(self, first: int = 20) -> list[Product]:
        data = await self._query(PRODUCTS_QUERY, {"first": first})
        products: list[Product] = []
        for node in data["products"]["nodes"]:
            price = node["priceRangeV2"]["minVariantPrice"]
            products.append(
                Product(
                    id=node["id"],
                    title=node["title"],
                    description=node.get("description"),
                    price=float(price["amount"]),
                    currency=price["currencyCode"],
                    image_url=(node.get("featuredImage") or {}).get("url"),
                )
            )
        return products
