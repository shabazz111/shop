"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getProduct, type Product } from "./products";
import { track } from "./analytics";

type CartLine = { product: Product; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  itemCount: number;
  total: number;
  add: (product: Product, source: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "shoppulse_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      // Restoring persisted state after hydration keeps server and client markup in sync.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuantities(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}"));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
    } catch {}
  }, [quantities, loaded]);

  const lines = useMemo(
    () =>
      Object.entries(quantities).flatMap(([id, quantity]) => {
        const product = getProduct(id);
        return product && quantity > 0 ? [{ product, quantity }] : [];
      }),
    [quantities],
  );

  const add = useCallback((product: Product, source: string) => {
    setQuantities((q) => ({ ...q, [product.id]: (q[product.id] ?? 0) + 1 }));
    track("product_added_to_cart", {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: product.price,
      quantity: 1,
      source,
    });
  }, []);

  const remove = useCallback((productId: string) => {
    const product = getProduct(productId);
    setQuantities((q) => {
      const next = { ...q };
      delete next[productId];
      return next;
    });
    if (product) {
      track("product_removed_from_cart", { product_id: product.id, product_name: product.name });
    }
  }, []);

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) return remove(productId);
      setQuantities((q) => ({ ...q, [productId]: quantity }));
    },
    [remove],
  );

  const clear = useCallback(() => setQuantities({}), []);

  const value = useMemo(
    () => ({
      lines,
      itemCount: lines.reduce((n, l) => n + l.quantity, 0),
      total: lines.reduce((n, l) => n + l.quantity * l.product.price, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [lines, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
