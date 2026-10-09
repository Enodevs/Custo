"use client";

/**
 * Admin page to create and manage products.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";

interface Product {
  id: string;
  name: string;
  bot_name?: string;
  description: string;
  created_at: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    bot_name: "",
    description: "",
  });

  const loadProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create product");
      }

      setFormData({ name: "", bot_name: "", description: "" });
      setShowForm(false);
      await loadProducts();
      alert("Product created successfully!");
    } catch (err) {
      console.error("Create error:", err);
      alert(err instanceof Error ? err.message : "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">
              Manage products for complaint intake
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "+ New Product"}
          </Button>
        </div>

        {/* Create form */}
        {showForm && (
          <Card className="p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Field>
                <FieldLabel htmlFor="name">Product Name *</FieldLabel>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Wema Bank, Jumia Nigeria"
                  required
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="bot_name">Bot Name (optional)</FieldLabel>
                <Input
                  id="bot_name"
                  value={formData.bot_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      bot_name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Ada, Support Assistant"
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description *</FieldLabel>
                <FieldDescription>
                  Explain what the product does, policies, common issues, etc.
                </FieldDescription>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Describe the product, services, policies, and common customer issues..."
                  rows={8}
                  required
                />
              </Field>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Products list */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              <p>No products yet. Create one to get started.</p>
            </Card>
          ) : (
            products.map((product) => (
              <Card key={product.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">
                      {product.name}
                    </h3>
                    {product.bot_name && (
                      <p className="text-sm text-muted-foreground mb-2">
                        Bot: {product.bot_name}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {product.description.slice(0, 200)}
                      {product.description.length > 200 && "..."}
                    </p>
                  </div>
                  <div className="ml-4 text-right text-xs text-muted-foreground">
                    <p>ID: {product.id.slice(0, 8)}</p>
                    <p>
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
