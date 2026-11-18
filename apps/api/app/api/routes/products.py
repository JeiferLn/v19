from fastapi import APIRouter

from app.schemas.product import Product
from app.services.products import list_products

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=list[Product], response_model_by_alias=True)
async def get_products() -> list[Product]:
    return await list_products()
