from app.core.config import get_settings
from app.integrations.shopify.client import ShopifyClient
from app.schemas.product import Product


async def list_products() -> list[Product]:
    settings = get_settings()
    if not settings.shopify_access_token:
        # Datos de ejemplo mientras no haya credenciales de Shopify.
        return [Product(id="demo-1", title="Producto de ejemplo", price=19.9, currency="EUR")]
    return await ShopifyClient(settings).list_products()
