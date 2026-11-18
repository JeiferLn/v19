# API

Con la API en marcha (`pnpm --filter @v19/api dev`), la documentación interactiva está en:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json

## Endpoints

| Método | Ruta               | Descripción                                       |
| ------ | ------------------ | ------------------------------------------------- |
| GET    | `/health`          | Estado del servicio                               |
| GET    | `/api/v1/products` | Productos (Shopify o datos demo sin credenciales) |

## Autenticación

Los endpoints protegidos usan la dependencia `CurrentUser` (`app/core/security.py`):

```python
from app.core.security import CurrentUser

@router.get("/me")
def me(user: CurrentUser) -> AuthenticatedUser:
    return user
```

El cliente envía `Authorization: Bearer <access_token de Supabase>`. La API verifica firma
(ES256/RS256 con las JWKS de `{SUPABASE_URL}/auth/v1/.well-known/jwks.json`), expiración, audiencia
(`authenticated`) y emisor (`{SUPABASE_URL}/auth/v1`). Cualquier fallo responde `401`. Todavía no
hay endpoints protegidos.
