// Genera JSON Schema desde los esquemas zod para que otros lenguajes (FastAPI/pytest) verifiquen el
// contrato. Ejecutar con `pnpm --filter @v19/validators gen:schemas`; el resultado se versiona.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { healthSchema, productSchema, userSchema, z } from "../src/index.ts";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "schemas");
mkdirSync(outDir, { recursive: true });

const schemas = { health: healthSchema, product: productSchema, user: userSchema };

for (const [name, schema] of Object.entries(schemas)) {
  const json = z.toJSONSchema(schema, { target: "draft-2020-12" });
  writeFileSync(join(outDir, `${name}.json`), `${JSON.stringify(json, null, 2)}\n`);
  console.log(`schemas/${name}.json`);
}
