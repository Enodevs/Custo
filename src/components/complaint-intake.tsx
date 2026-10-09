"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  slug?: string;
  name: string;
  bot_name?: string;
  description: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ComplaintIntakeProps {
  slug?: string;
}

export default function ComplaintIntake({ slug }: ComplaintIntakeProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [conversationToken, setConversationToken] = useState<string | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoadingProduct(true);
      setProductError(null);

      try {
        const res = slug
          ? await fetch(`/api/public/products/${encodeURIComponent(slug)}`)
          : await fetch("/api/products");

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error ||
              (slug
                ? "This support page could not be found."
                : "Failed to load products."),
          );
        }

        if (cancelled) return;

        if (slug) {
          const product = data.product as Product | undefined;

          if (!product) {
            throw new Error("This support page could not be found.");
          }

          setSelectedProduct(product);
          setProducts([product]);
        } else {
          const loadedProducts = (data.products || []) as Product[];
          setProducts(loadedProducts);

          if (loadedProducts.length > 0) {
            setSelectedProduct(loadedProducts[0]);
          } else {
            setProductError("You haven't created a product yet.");
          }
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Failed to load support page:", error);
        setProductError(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading this support page.",
        );
      } finally {
        if (!cancelled) setLoadingProduct(false);
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async () => {
    if (
      !input.trim() ||
      !selectedProduct ||
      loading ||
      loadingProduct ||
      productError
    ) {
      return;
    }

    const userMessage = input.trim();

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/support/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          message: userMessage,
          complaint_id: complaintId,
          conversation_token: conversationToken,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Thanks. Could you tell me a little more?",
        },
      ]);

      if (data.complaint_id) setComplaintId(data.complaint_id);
      if (data.conversation_token) {
        setConversationToken(data.conversation_token);
      }

      if (data.ready) setIsReady(true);
    } catch (error) {
      console.error("Send error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? `${error.message} Please try again.`
              : "Sorry, something went wrong. Please try again.",
        },
      ]);

      // Restore the message so the customer doesn't have to retype it.
      setInput(userMessage);
    } finally {
      setLoading(false);
      textareaRef.current?.focus();
    }
  };

  const displayName = selectedProduct?.name || "Customer Support";
  const assistantName =
    selectedProduct?.bot_name?.trim() || `${displayName} Support`;

  return (
    <main className="min-h-screen bg-background px-4 py-8 md:px-8 md:py-12">
      {" "}
      <div className="mx-auto max-w-3xl">
        {/* Product identity */}{" "}
        <header className="mb-8">
          {" "}
          <div className="mb-5 flex items-center gap-3">
            {" "}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
              {displayName.slice(0, 1).toUpperCase()}{" "}
            </div>
            ```
            <div className="min-w-0">
              <p className="truncate font-semibold">{displayName}</p>
              <p className="text-sm text-muted-foreground">
                Official support channel
              </p>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Support
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            How can we help?
          </h1>
          <p className="mt-2 max-w-xl text-muted-foreground">
            Tell us what happened. Our AI support assistant will help understand
            your issue and record your complaint.
          </p>
        </header>
        {/* Product loading/error */}
        {loadingProduct ? (
          <Card className="flex min-h-64 items-center justify-center p-8">
            <div className="text-center">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">
                Loading support...
              </p>
            </div>
          </Card>
        ) : productError ? (
          <Card className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-xl">
              !
            </div>
            <h2 className="text-lg font-semibold">Unable to open support</h2>
            <p className="mt-2 text-sm text-muted-foreground">{productError}</p>
          </Card>
        ) : (
          <>
            {/* Product selector for authenticated dashboard intake */}
            {!slug && products.length > 1 && !complaintId && (
              <Card className="mb-4 p-4">
                <label
                  htmlFor="support-product"
                  className="mb-2 block text-sm font-medium"
                >
                  Product
                </label>

                <select
                  id="support-product"
                  value={selectedProduct?.id || ""}
                  onChange={(event) => {
                    const product = products.find(
                      (item) => item.id === event.target.value,
                    );

                    setSelectedProduct(product || null);
                    setMessages([]);
                    setComplaintId(null);
                    setConversationToken(null);
                    setIsReady(false);
                  }}
                  className="w-full rounded-lg border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </Card>
            )}

            {/* Conversation */}
            <Card className="overflow-hidden">
              <div className="flex items-center gap-3 border-b p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                  {assistantName.slice(0, 1).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {assistantName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Complaint assistance
                  </p>
                </div>
              </div>

              <div
                aria-live="polite"
                aria-label="Support conversation"
                className="min-h-[320px] max-h-[520px] space-y-5 overflow-y-auto p-4 md:p-6"
              >
                {messages.length === 0 && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-muted p-4">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        {assistantName}
                      </p>
                      <p className="text-sm leading-6">
                        Hi! I'm here to help with your {displayName} issue. Tell
                        me what happened, and we'll take it from there.
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={`${index}-${message.role}`}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3.5 md:max-w-[80%] ${
                        message.role === "user"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <p className="mb-1 text-xs font-medium text-muted-foreground">
                          {assistantName}
                        </p>
                      )}

                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                      <p className="animate-pulse text-sm text-muted-foreground">
                        {assistantName} is thinking...
                      </p>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {isReady && (
                <div className="border-t px-4 pt-4 md:px-6">
                  <div className="rounded-xl border border-green-600/30 bg-green-600/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-green-700">
                        ✓
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold">Complaint recorded</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Your complaint has been recorded. Keep this reference
                          for future follow-up.
                        </p>
                        {complaintId && (
                          <div className="mt-3 break-all rounded-lg border bg-background px-3 py-2 font-mono text-xs">
                            Reference: {complaintId}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t p-4 md:p-6">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSendMessage();
                  }}
                  className="space-y-3"
                >
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey &&
                        !event.nativeEvent.isComposing
                      ) {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    placeholder={
                      isReady
                        ? "Add any further details..."
                        : "Describe what happened..."
                    }
                    aria-label="Describe your complaint"
                    className="min-h-[100px] resize-y"
                    maxLength={5000}
                    disabled={loading || !selectedProduct}
                  />

                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                      Please avoid sharing passwords or PINs.
                      <span className="ml-1">{input.length}/5000</span>
                    </p>

                    <Button
                      type="submit"
                      disabled={
                        loading ||
                        !input.trim() ||
                        !selectedProduct ||
                        loadingProduct
                      }
                    >
                      {loading ? "Sending..." : "Send message"}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              Powered by Custo · Your complaint reference helps you follow up.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
