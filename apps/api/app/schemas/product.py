from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class Product(BaseModel):
    """Espejo de `Product` en packages/types (se serializa en camelCase)."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: str
    title: str
    description: str | None = None
    price: float
    currency: str
    image_url: str | None = None
