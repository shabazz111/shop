import { Suspense } from "react";
import Link from "next/link";

async function OrderNumber({ searchParams }: { searchParams: PageProps<"/checkout/success">["searchParams"] }) {
  const { order } = await searchParams;
  if (!order) return null;
  return (
    <p className="mt-2 text-muted">
      Order number <span className="font-mono text-foreground">{order}</span>
    </p>
  );
}

export default function SuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="text-5xl">✅</div>
      <h1 className="mt-4 text-2xl font-semibold">Thanks for your order!</h1>
      <Suspense>
        <OrderNumber searchParams={searchParams} />
      </Suspense>
      <p className="mt-2 text-sm text-muted">This was a simulated checkout — no payment was taken.</p>
      <Link href="/" className="mt-6 inline-block text-accent hover:underline">
        Keep shopping →
      </Link>
    </div>
  );
}
