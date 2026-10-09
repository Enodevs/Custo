"use client";

import { useProductContext } from "./product-context";

export function ProductSelector() {
  const {
    products,
    selectedProductId,
    setSelectedProductId,
    loadingProducts,
    productsError,
  } = useProductContext();

  if (loadingProducts) {
    return <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />;
  }

  if (productsError) {
    return <p className="text-sm text-destructive">{productsError}</p>;
  }

  if (products.length === 0) {
    return <p className="text-sm text-muted-foreground">No products yet </p>;
  }

  return (
    <div className="flex items-center gap-2">
      {" "}
      <label
        htmlFor="dashboard-product"
        className="hidden text-sm text-muted-foreground sm:inline"
      >
        Product{" "}
      </label>
      <select
        id="dashboard-product"
        value={selectedProductId}
        onChange={(event) => setSelectedProductId(event.target.value)}
        className="h-9 max-w-56 rounded-md border border-border bg-background px-3 text-sm"
      >
        <option value="all">All products</option>

        {products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </select>
    </div>
  );
}
