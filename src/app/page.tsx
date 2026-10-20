import { Storefront } from "./Storefront";

export default function Home() {
  return (
    <>
      <section className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Gear for everyday life</h1>
        <p className="mt-2 text-muted">Audio, wearables, home and accessories — shipped free over $50.</p>
      </section>
      <Storefront />
    </>
  );
}
