import type { Product } from "@v19/types";
import { productSchema } from "@v19/validators";
import { t } from "@/lib/i18n";

const demo: Product = productSchema.parse({
  id: "demo-1",
  title: "Producto de ejemplo",
  description: null,
  price: 19.9,
  currency: "EUR",
  imageUrl: null,
});

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold">{t("common.welcome")}</h1>
      <p className="text-zinc-500">
        Next.js · Turborepo · pnpm · paquetes compartidos <code>@v19/*</code>
      </p>
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        {demo.title} — {demo.price} {demo.currency}
      </div>
    </main>
  );
}
