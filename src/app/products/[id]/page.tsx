import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getProduct, products } from "@/lib/products";
import { ProductActions } from "./ProductActions";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: PageProps<"/products/[id]">) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div>
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Back to shop
      </Link>
      <div className="mt-4 grid gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-accent-soft text-[9rem]">
          {product.emoji}
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-sm uppercase tracking-wide text-muted">{product.category}</span>
          <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="text-2xl font-semibold tabular-nums">{formatPrice(product.price)}</p>
          <p className="text-muted">{product.description}</p>
          <ProductActions productId={product.id} />
        </div>
      </div>
    </div>
  );
}
