import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getProduct, products } from "@/lib/products";
import { ProductActions } from "./ProductActions";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <div>
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← Back to shop
      </Link>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductDetails params={params} />
      </Suspense>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mt-4 grid gap-8 md:grid-cols-2">
      <div className="aspect-square animate-pulse rounded-2xl bg-accent-soft" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-24 animate-pulse rounded bg-accent-soft" />
        <div className="h-8 w-2/3 animate-pulse rounded bg-accent-soft" />
        <div className="h-7 w-28 animate-pulse rounded bg-accent-soft" />
        <div className="h-16 animate-pulse rounded bg-accent-soft" />
      </div>
    </div>
  );
}

async function ProductDetails({
  params,
}: {
  params: PageProps<"/products/[id]">["params"];
}) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="mt-4 grid gap-8 md:grid-cols-2">
      <div className="flex aspect-square items-center justify-center rounded-2xl bg-accent-soft text-[9rem]">
        {product.emoji}
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-sm uppercase tracking-wide text-muted">
          {product.category}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight">
          {product.name}
        </h1>
        <p className="text-2xl font-semibold tabular-nums">
          {formatPrice(product.price)}
        </p>
        <p className="text-muted">{product.description}</p>
        <ProductActions productId={product.id} />
      </div>
    </div>
  );
}
