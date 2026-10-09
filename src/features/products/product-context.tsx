"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "@/data/types";

type ProductContextValue = {
  products: Product[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  loadingProducts: boolean;
  productsError: string | null;
};

const ProductContext = createContext<ProductContextValue | null>(null);
const STORAGE_KEY = "custo-selected-product";

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductIdState] = useState("all");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Please sign in to view your products."
              : "Couldn't load your products.",
          );
        }

        const result = (await response.json()) as { products: Product[] };

        if (cancelled) return;

        const userProducts = result.products ?? [];
        setProducts(userProducts);

        const savedId = window.localStorage.getItem(STORAGE_KEY);
        const savedExists = userProducts.some(
          (product) => product.id === savedId,
        );

        setSelectedProductIdState(savedExists ? savedId! : "all");
      } catch (error) {
        if (!cancelled) {
          setProductsError(
            error instanceof Error
              ? error.message
              : "Couldn't load your products.",
          );
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  const setSelectedProductId = useCallback((id: string) => {
    setSelectedProductIdState(id);

    if (id === "all") {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        selectedProductId,
        setSelectedProductId,
        loadingProducts,
        productsError,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const context = useContext(ProductContext);

  if (!context) {
    throw new Error("useProductContext must be used within ProductProvider");
  }

  return context;
}
