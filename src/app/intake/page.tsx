"use client";

/**
 * Customer-facing complaint intake page.
 * Shows AI conversation and collects complaint details.
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface Product {
  id: string;
  name: string;
  bot_name?: string;
  description: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function IntakePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [conversationToken, setConversationToken] = useState<string | null>(null);

  useEffect(() => {
    // Load products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setProducts(data.products);
          if (data.products.length > 0) {
            setSelectedProduct(data.products[0]);
          }
        }
      })
      .catch((err) => console.error("Failed to load products:", err));
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedProduct || loading) return;

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
        throw new Error(data.error || "Failed to send message");
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);

      if (data.complaint_id) {
        setComplaintId(data.complaint_id);
      }

      if (data.conversation_token) {
        setConversationToken(data.conversation_token);
      }

      if (data.ready) {
        setIsReady(true);
      }
    } catch (err) {
      console.error("Send error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Customer Support</h1>
          <p className="text-muted-foreground">
            Tell us what happened and we'll help you file a complaint.
          </p>
        </div>

        {/* Product selector */}
        {products.length > 1 && !complaintId && (
          <Card className="p-4 mb-4">
            <label className="block text-sm font-medium mb-2">
              Select Product
            </label>
            <select
              value={selectedProduct?.id || ""}
              onChange={(e) => {
                const product = products.find((p) => p.id === e.target.value);
                setSelectedProduct(product || null);
              }}
              className="w-full p-2 border rounded"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Card>
        )}

        {/* Conversation */}
        <Card className="p-4 mb-4 min-h-[400px] max-h-[600px] overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <p className="mb-2">
                Hi! I'm {selectedProduct?.bot_name || "Support Assistant"}.
              </p>
              <p>How can I help you today?</p>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-start mt-4">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm text-muted-foreground">Typing...</p>
              </div>
            </div>
          )}
        </Card>

        {/* Status indicator */}
        {isReady && (
          <div className="mb-4 p-4 bg-ok/10 border border-ok rounded-lg">
            <p className="text-sm font-medium">
              ✓ Your complaint has been filed successfully!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Reference: {complaintId}
            </p>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder={
              isReady
                ? "Case filed. You can add more details if needed..."
                : "Describe your issue..."
            }
            className="flex-1 min-h-[80px]"
            disabled={loading || !selectedProduct}
          />
          <Button
            onClick={handleSendMessage}
            disabled={loading || !input.trim() || !selectedProduct}
            className="self-end"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
