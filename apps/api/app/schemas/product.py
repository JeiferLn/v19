from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from pydantic.alias_generators import to_camel


class Product(BaseModel):
    """Espejo de `productSchema` en @v19/validators (se serializa en camelCase).

    Las restricciones deben coincidir con las de zod; `tests/test_contracts.py` valida las
    respuestas de la API contra el JSON Schema generado desde zod.
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: str
    title: str = Field(min_length=1)
    description: str | None = None
    price: float = Field(ge=0)
    currency: str = Field(min_length=3, max_length=3)
    image_url: HttpUrl | None = None
