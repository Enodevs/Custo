/**
 * Live demo page - customer chat simulation.
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockDataClient } from "@/data/adapters/mock";
import { Loader2, Send } from "lucide-react";
import { formatRelativeTime } from "@/lib/formatting";

export default function LiveDemoPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      await mockDataClient.submitInAppComplaint({
        text: message,
        category: "other",
      });
      setSubmitted(true);
      setMessage("");
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Live Demo</h1>
        <p className="text-sm text-muted-foreground mt-1">
          See how complaints flow from customer to dashboard in real-time
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Customer View
            </h2>
            <span className="text-xs text-muted-foreground">
              In-App Chat Support
            </span>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {/* Chat Header */}
            <div className="border-b border-border bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-accent-primary text-white flex items-center justify-center text-sm font-semibold">
                  W
                </div>
                <div>
                  <p className="text-sm font-medium">Wema Bank Support</p>
                  <p className="text-xs text-muted-foreground">
                    Usually replies instantly
                  </p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-4 space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-accent-primary text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  W
                </div>
                <div className="rounded-lg bg-muted p-3 max-w-[80%]">
                  <p className="text-sm">
                    Hi! How can we help you today? You can describe your issue
                    and we'll route it to the right team.
                  </p>
                </div>
              </div>

              {submitted && (
                <>
                  <div className="flex gap-2 justify-end">
                    <div className="rounded-lg bg-accent-primary text-white p-3 max-w-[80%]">
                      <p className="text-sm">{message}</p>
                    </div>
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs flex-shrink-0">
                      U
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded-full bg-accent-primary text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                      W
                    </div>
                    <div className="rounded-lg bg-ok/10 border border-ok/20 p-3 max-w-[80%]">
                      <p className="text-sm font-medium text-ok mb-1">
                        Case Filed Successfully
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Your complaint has been logged and our team will review
                        it shortly. Reference: #
                        {Date.now().toString().slice(-6)}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-border p-4"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="Describe your issue..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={sending}
                  className="flex-1"
                />
                <Button type="submit" disabled={sending || !message.trim()}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Bank View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              What the Bank Sees
            </h2>
            <span className="text-xs text-muted-foreground">
              Real-Time Dashboard
            </span>
          </div>

          <div className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                In-App Signals Received
              </p>
              <p className="text-3xl font-semibold tabular-nums">
                {submitted ? "1" : "0"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {submitted ? formatRelativeTime(new Date()) : "Waiting..."}
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Live Classification
              </p>
              {submitted ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">Other</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Language</span>
                    <span className="font-medium">English</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium text-ok">85%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Severity</span>
                    <span className="font-medium tabular-nums">7</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Submit a complaint to see classification
                </p>
              )}
            </div>

            <div className="rounded-lg border border-border bg-card p-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Incident Detection
              </p>
              {submitted ? (
                <p className="text-sm">
                  Monitoring for pattern. Incident flagged when count ≥ 5 and ≥
                  2x baseline.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No active incidents
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-border bg-muted/20 p-6">
        <h3 className="text-sm font-semibold mb-2">How It Works</h3>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Customer describes their issue in the chat</li>
          <li>AI classifies the complaint by category and language</li>
          <li>System assigns severity score based on content analysis</li>
          <li>
            Complaint is grouped with similar ones from the same bank and
            category
          </li>
          <li>
            When threshold is met (≥5 complaints, ≥2x baseline), an incident is
            automatically flagged
          </li>
          <li>Dashboard updates in real-time for the CX team to review</li>
        </ol>
      </div>
    </div>
  );
}
