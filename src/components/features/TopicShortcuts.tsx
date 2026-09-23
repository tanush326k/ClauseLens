"use client";

import { cn } from "@/lib/utils";

// ============================================================
// TopicShortcuts — Day 6 Editorial Topic Cards
// "Start with a topic"
// ============================================================

interface TopicShortcutsProps {
  onSelect: (examplePrompt: string) => void;
  className?: string;
}

const TOPIC_ITEMS: Array<{
  id: string;
  label: string;
  description: string;
  examplePrompt: string;
  icon: React.ReactNode;
  accent: {
    iconBg: string;
    iconText: string;
    iconBorder: string;
    hoverBorder: string;
  };
}> = [
  {
    id: "housing",
    label: "Housing",
    description: "Rent changes & deposit disputes",
    examplePrompt: "I received a notice from my landlord regarding rent increases and deposit deductions, and I need to know my rights.",
    accent: {
      iconBg: "bg-[#FCF8F0]",
      iconText: "text-[#9C6E1E]",
      iconBorder: "border-[#EBDAB8]",
      hoverBorder: "hover:border-[#9C6E1E]/50",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: "employment",
    label: "Employment",
    description: "Non-competes & notice periods",
    examplePrompt: "My employer is asking me to sign a non-compete clause restricting where I can work for 12 months.",
    accent: {
      iconBg: "bg-[#EDF3FA]",
      iconText: "text-[#112240]",
      iconBorder: "border-[#C4D6EB]",
      hoverBorder: "hover:border-[#112240]/50",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </svg>
    ),
  },
  {
    id: "contracts",
    label: "Contracts",
    description: "Indemnity & liability caps",
    examplePrompt: "I need to understand the indemnity and liability limitation clauses in this consulting agreement before signing.",
    accent: {
      iconBg: "bg-[#F2F5F8]",
      iconText: "text-[#3A506B]",
      iconBorder: "border-[#CDD7E1]",
      hoverBorder: "hover:border-[#3A506B]/50",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    id: "consumer",
    label: "Consumer",
    description: "Cancellations & refund rights",
    examplePrompt: "A company refused to honor my cancellation request or refund within the statutory cooling-off period.",
    accent: {
      iconBg: "bg-[#F0F7F3]",
      iconText: "text-[#195C38]",
      iconBorder: "border-[#C0DFCD]",
      hoverBorder: "hover:border-[#195C38]/50",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
  {
    id: "debt",
    label: "Payments & Debt",
    description: "Late interest & fee penalties",
    examplePrompt: "A debt collection agency has sent a formal notice with unexpected fees and interest penalties.",
    accent: {
      iconBg: "bg-[#FDF5F1]",
      iconText: "text-[#943C1D]",
      iconBorder: "border-[#ECCEC2]",
      hoverBorder: "hover:border-[#943C1D]/50",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
      </svg>
    ),
  },
  {
    id: "business",
    label: "Business",
    description: "Partnerships & voting terms",
    examplePrompt: "I am evaluating a partnership operating agreement with specific voting thresholds and dissolution clauses.",
    accent: {
      iconBg: "bg-[#F4F3FA]",
      iconText: "text-[#473B7B]",
      iconBorder: "border-[#D7D2EC]",
      hoverBorder: "hover:border-[#473B7B]/50",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
  },
  {
    id: "privacy",
    label: "Privacy & Data",
    description: "Tracking policies & disclosures",
    examplePrompt: "A mobile application privacy policy states they may sell anonymized browsing data to third-party brokers.",
    accent: {
      iconBg: "bg-[#EEF8F8]",
      iconText: "text-[#165B5E]",
      iconBorder: "border-[#BDE3E4]",
      hoverBorder: "hover:border-[#165B5E]/50",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    id: "dispute",
    label: "Formal Notices",
    description: "Demand letters & deadlines",
    examplePrompt: "I have received a formal dispute letter and need a structured explanation of what it requires.",
    accent: {
      iconBg: "bg-[#FDF2F2]",
      iconText: "text-[#8C2424]",
      iconBorder: "border-[#EAC4C4]",
      hoverBorder: "hover:border-[#8C2424]/50",
    },
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
];

export function TopicShortcuts({ onSelect, className }: TopicShortcutsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-2.5">
        <p
          className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider font-mono"
          id="topic-shortcuts-label"
        >
          Common Scenarios
        </p>
        <span className="text-[12px] text-[var(--color-text-muted)] hidden sm:inline font-mono">
          Click any scenario to populate the workspace
        </span>
      </div>

      {/* 4x2 desktop grid, 2 cols on mobile */}
      <div
        role="group"
        aria-labelledby="topic-shortcuts-label"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4"
      >
        {TOPIC_ITEMS.map((topic) => (
          <button
            key={topic.id}
            type="button"
            onClick={() => onSelect(topic.examplePrompt)}
            aria-label={`Start with topic: ${topic.label} — ${topic.description}`}
            className={cn(
              "flex flex-col justify-between p-4 text-left",
              "bg-[var(--color-bg-card)] hover:bg-[var(--color-surface)]",
              "border border-[var(--color-border)]",
              topic.accent.hoverBorder,
              "rounded-[var(--radius-md)]",
              "transition-all duration-200",
              "group cursor-pointer select-none shadow-[var(--shadow-xs)] hover:shadow-[var(--shadow-sm)]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand)]",
            )}
          >
            <div className="flex items-center justify-between w-full mb-2.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-[var(--radius-sm)] flex-shrink-0 flex items-center justify-center border transition-all duration-200",
                  topic.accent.iconBg,
                  topic.accent.iconText,
                  topic.accent.iconBorder,
                  "group-hover:scale-105 shadow-xs",
                )}
                aria-hidden="true"
              >
                {topic.icon}
              </div>
              <span
                className={cn(
                  "text-[11px] font-mono transition-all duration-200 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5",
                  topic.accent.iconText,
                )}
                aria-hidden="true"
              >
                →
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs sm:text-[13px] font-semibold text-[var(--color-text-primary)] tracking-tight block group-hover:text-[var(--color-brand)] transition-colors duration-200">
                {topic.label}
              </span>
              <p className="text-[11px] text-[var(--color-text-muted)] leading-normal line-clamp-1">
                {topic.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
