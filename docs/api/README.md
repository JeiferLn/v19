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
