
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

interface Product {
  id: string;
  name: string;
  slug?: string;
  bot_name?: string;
  description: string;
  created_at: string;
}

interface ProductForm {
  name: string;
  bot_name: string;
  description: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  bot_name: "",
  description: "",
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ProductForm>(EMPTY_FORM);

  const [formError, setFormError] = useState("");
  const [listError, setListError] = useState("");
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [createdPublicUrl, setCreatedPublicUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    setListError("");

    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load products.");
      }

      setProducts(data.products ?? []);
    } catch (error) {
      setListError(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading products.",
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function updateField(field: keyof ProductForm, value: string) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
    setFormError("");
  }

  function openForm() {
    setFormError("");
    setCreatedProduct(null);
    setCreatedPublicUrl("");
    setCopied(false);
    setShowForm(true);
  }

  function closeForm() {
    if (loading) return;

    setShowForm(false);
    setFormError("");
    setFormData(EMPTY_FORM);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setCreatedProduct(null);
    setCreatedPublicUrl("");
    setCopied(false);

    const name = formData.name.trim();
    const description = formData.description.trim();
    const botName = formData.bot_name.trim();

    if (!name || !description) {
      setFormError("Enter a product name and business description.");
      return;
    }

    if (name.length > 120 || botName.length > 120) {
      setFormError("Names must be 120 characters or fewer.");
      return;
    }

    if (description.length > 10000) {
      setFormError("The description must be 10,000 characters or fewer.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          bot_name: botName,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create product.");
      }

      if (!data.product) {
        throw new Error("The server did not return the created product.");
      }

      const product = data.product as Product;

      setCreatedProduct(product);
      setCreatedPublicUrl(
        product.slug
          ? `${window.location.origin}/p/${product.slug}`
          : "",
      );

      setFormData(EMPTY_FORM);
      setShowForm(false);

      // Creation has succeeded even if refreshing the list later fails.
      await loadProducts();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyPublicUrl() {
    if (!createdPublicUrl) return;

    try {
      await navigator.clipboard.writeText(createdPublicUrl);
      setCopied(true);
    } catch {
      setFormError(
        "Could not copy automatically. Select and copy the URL manually.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Products</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your businesses and their customer complaint channels.
            </p>
          </div>

          <Button onClick={openForm} disabled={showForm || loading}>
            + New Product
          </Button>
        </header>

        {createdProduct && (
          <Card className="space-y-4 border p-6">
            <div>
              <h2 className="text-lg font-semibold">
                Product created successfully
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {createdProduct.name} is ready. Share its public support page
                with your customers.
              </p>
            </div>

            {createdPublicUrl ? (
              <div className="space-y-3">
                <label
                  htmlFor="public-support-url"
                  className="text-sm font-medium"
                >
                  Public support link
                </label>

                <Input
                  id="public-support-url"
                  value={createdPublicUrl}
                  readOnly
                  onFocus={(event) => event.currentTarget.select()}
                />

                <div className="flex flex-wrap gap-2">
                  <Button onClick={copyPublicUrl}>
                    {copied ? "Copied!" : "Copy support link"}
                  </Button>

                  <a
                    href={createdPublicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Open support page
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                The product was created, but its public slug was not returned.
                Check the products API before sharing a link.
              </p>
            )}

            <Button
              variant="ghost"
              onClick={() => {
                setCreatedProduct(null);
                setCreatedPublicUrl("");
                setCopied(false);
              }}
            >
              Dismiss
            </Button>
          </Card>
        )}

        {showForm && (
          <Card className="space-y-6 border p-6">
            <div>
              <h2 className="text-xl font-semibold">Create a product</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Set up your business profile so Custo can handle customer
                complaints with the right context.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Field>
                <FieldLabel htmlFor="name">Business or product name *</FieldLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="e.g. Acme Store"
                  maxLength={120}
                  required
                  disabled={loading}
                />
                <FieldDescription>
                  The name customers will see on your support page.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="bot_name">
                  Support assistant name
                </FieldLabel>
                <Input
                  id="bot_name"
                  value={formData.bot_name}
                  onChange={(event) =>
                    updateField("bot_name", event.target.value)
                  }
                  placeholder="e.g. Ada"
                  maxLength={120}
                  disabled={loading}
                />
                <FieldDescription>
                  Optional. Defaults to your business name if left empty.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="description">
                  Business description and support context *
                </FieldLabel>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="Describe your business, products or services, relevant policies, and common customer issues."
                  rows={7}
                  maxLength={10000}
                  required
                  disabled={loading}
                />
                <FieldDescription>
                  Include useful facts and policies. The assistant must not
                  invent answers when information is missing.
                </FieldDescription>
              </Field>

              {formError && (
                <p
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
                >
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating product..." : "Create product"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Your products</h2>
            <p className="text-sm text-muted-foreground">
              Products belonging to your account.
            </p>
          </div>

          {listError && (
            <Card className="space-y-3 border p-5">
              <p role="alert" className="text-sm text-destructive">
                {listError}
              </p>
              <Button
                variant="outline"
                onClick={() => void loadProducts()}
                disabled={loadingProducts}
              >
                Try again
              </Button>
            </Card>
          )}

          {loadingProducts ? (
            <Card className="p-8 text-center text-muted-foreground">
              Loading products...
            </Card>
          ) : !listError && products.length === 0 ? (
            <Card className="space-y-3 p-8 text-center">
              <h3 className="text-lg font-semibold">No products yet</h3>
              <p className="text-sm text-muted-foreground">
                Create your first product to get a public complaint page and
                start collecting customer feedback.
              </p>
              {!showForm && (
                <div>
                  <Button onClick={openForm}>Create your first product</Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {products.map((product) => (
                <Card key={product.id} className="space-y-4 p-5 md:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold">{product.name}</h3>

                      {product.bot_name && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          Support assistant: {product.bot_name}
                        </p>
                      )}

                      <p className="mt-3 whitespace-pre-wrap break-words text-sm text-muted-foreground">
                        {product.description.length > 200
                          ? `${product.description.slice(0, 200)}...`
                          : product.description}
                      </p>
                    </div>

                    <div className="text-sm text-muted-foreground sm:text-right">
                      <p>ID: {product.id.slice(0, 8)}</p>
                      <p>
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString()
                          : "Date unavailable"}
                      </p>
                    </div>
                  </div>

                  {product.slug && (
                    <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                      <a
                        href={`/p/${product.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium underline underline-offset-4"
                      >
                        Open public support page
                      </a>
                      <button
                        type="button"
                        className="text-sm text-muted-foreground underline underline-offset-4"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              `${window.location.origin}/p/${product.slug}`,
                            );
                          } catch {
                            setListError("Could not copy the support link.");
                          }
                        }}
                      >
                        Copy support link
                      </button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
