// Falla si hay cambios (modificados o sin seguimiento) en las rutas indicadas.
// Uso: node scripts/check-clean.mjs <ruta> [...rutas]
import { execFileSync } from "node:child_process";

const paths = process.argv.slice(2);
const out = execFileSync("git", ["status", "--porcelain", "--", ...paths], { encoding: "utf8" });

if (out.trim()) {
  console.error(`Hay cambios sin commitear en ${paths.join(", ")}:\n${out}`);
  console.error("Regenera y commitea los archivos generados.");
  process.exit(1);
}
console.log(`Sin cambios en ${paths.join(", ")}`);
