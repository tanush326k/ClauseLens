"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { FollowUpMessage } from "@/types";
import { generateId } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

// ============================================================
// FollowUpPanel — follow-up Q&A interface
// UI only for Day 1. API connection on Day 2.
// ============================================================

interface FollowUpPanelProps {
  className?: string;
}

export function FollowUpPanel({ className }: FollowUpPanelProps) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<FollowUpMessage[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canSubmit = question.trim().length >= 5 && !isSubmitting;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!canSubmit) return;

      const q = question.trim();
      setQuestion("");

      // Add user question immediately
      const newMessage: FollowUpMessage = {
        id: generateId("fq"),
        question: q,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);

      // Simulate async — will be replaced with real API on Day 2
      setIsSubmitting(true);
      await new Promise((r) => setTimeout(r, 800));
      setIsSubmitting(false);

      // NOTE: On Day 2, replace the above with:
      // const answer = await analyzeFollowUp(q, context);
      // setMessages(prev => prev.map(m => m.id === newMessage.id ? { ...m, answer } : m));
    },
    [canSubmit, question],
  );

  return (
    <section
      aria-label="Follow-up questions"
      className={cn(
        "border-t border-[var(--color-border-subtle)]",
        "pt-6 space-y-4",
        className,
      )}
    >
      <div>
        <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
          Have a follow-up question?
        </h3>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Ask anything about this analysis
        </p>
      </div>

      {/* Message history */}
      {messages.length > 0 && (
        <div className="space-y-3" aria-live="polite" aria-label="Follow-up conversation">
          {messages.map((msg) => (
            <FollowUpMessage key={msg.id} message={msg} isLoading={isSubmitting && !msg.answer} />
          ))}
        </div>
      )}

      {/* API not connected notice */}
      <Alert variant="info">
        <strong>Day 1 UI preview.</strong> Follow-up analysis will be enabled when the AI backend is connected on Day 2.
      </Alert>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2 items-start"
        aria-label="Ask a follow-up question"
      >
        <div className="flex-1 relative">
          <label htmlFor="followup-input" className="sr-only">
            Ask a follow-up question about this analysis
          </label>
          <input
            ref={inputRef}
            id="followup-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask something about this analysis…"
            aria-describedby="followup-hint"
            className={cn(
              "w-full h-10 px-3.5",
              "text-sm text-[var(--color-text-primary)]",
              "placeholder:text-[var(--color-text-muted)]",
              "bg-[var(--color-bg-card)]",
              "border-2 rounded-[var(--radius-md)]",
              "outline-none",
              "transition-all duration-[var(--transition-base)]",
              isFocused
                ? "border-[var(--color-brand)] shadow-[0_0_0_3px_var(--color-brand-subtle)]"
                : "border-[var(--color-border)] hover:border-[var(--color-text-muted)]",
            )}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={!canSubmit}
          isLoading={isSubmitting}
        >
          Ask
        </Button>
      </form>

      <p
        id="followup-hint"
        className="text-xs text-[var(--color-text-muted)]"
      >
        Tip: Be specific — the more detail you give, the more useful the response.
      </p>
    </section>
  );
}

// ─── Single message bubble ─────────────────────────────────

function FollowUpMessage({
  message,
  isLoading,
}: {
  message: FollowUpMessage;
  isLoading: boolean;
}) {
  return (
    <div className="space-y-2">
      {/* User question */}
      <div className="flex justify-end">
        <div
          className={cn(
            "max-w-[85%] px-3.5 py-2.5",
            "bg-[var(--color-brand-subtle)]",
            "border border-[var(--color-brand-muted)]",
            "rounded-[var(--radius-lg)] rounded-tr-[var(--radius-sm)]",
            "text-sm text-[var(--color-text-primary)]",
            "leading-relaxed",
          )}
        >
          {message.question}
        </div>
      </div>

      {/* Answer or loading */}
      <div className="flex justify-start">
        <div
          className={cn(
            "max-w-[85%] px-3.5 py-2.5",
            "bg-[var(--color-bg-card)]",
            "border border-[var(--color-border-subtle)]",
            "rounded-[var(--radius-lg)] rounded-tl-[var(--radius-sm)]",
            "shadow-[var(--shadow-xs)]",
            "text-sm text-[var(--color-text-secondary)]",
            "leading-relaxed",
          )}
        >
          {isLoading ? (
            <TypingIndicator />
          ) : message.answer ? (
            message.answer
          ) : (
            <span className="italic text-[var(--color-text-muted)]">
              Follow-up answers will appear here once the AI backend is connected.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center py-1" aria-label="Response loading">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)] animate-bounce"
          style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
        />
      ))}
    </div>
  );
}
