// ============================================================
// ClauseLens — Static Content & Configuration
// All copy, topic shortcuts, and result section metadata
// ============================================================

import type { TopicShortcut, ResultSection } from "@/types";

export const TOPIC_SHORTCUTS: TopicShortcut[] = [
  {
    id: "housing",
    label: "Housing",
    icon: "🏠",
    examplePrompt: "I received a notice from my landlord regarding rent increases and deposit deductions, and I need to know my rights.",
  },
  {
    id: "employment",
    label: "Employment",
    icon: "💼",
    examplePrompt: "My employer is asking me to sign a non-compete clause restricting where I can work for 12 months.",
  },
  {
    id: "contracts",
    label: "Contracts",
    icon: "📄",
    examplePrompt: "I need to understand the indemnity and liability limitation clauses in this consulting agreement before signing.",
  },
  {
    id: "consumer",
    label: "Consumer",
    icon: "🛍️",
    examplePrompt: "A company refused to honor my cancellation request or refund within the statutory cooling-off period.",
  },
  {
    id: "debt",
    label: "Payments & Debt",
    icon: "💳",
    examplePrompt: "A debt collection agency has sent a formal notice with unexpected fees and interest penalties.",
  },
  {
    id: "business",
    label: "Business",
    icon: "🏢",
    examplePrompt: "I am evaluating a partnership operating agreement with specific voting thresholds and dissolution clauses.",
  },
  {
    id: "privacy",
    label: "Privacy",
    icon: "🔒",
    examplePrompt: "A mobile application privacy policy states they may sell anonymized browsing data to third-party brokers.",
  },
  {
    id: "other",
    label: "Other",
    icon: "⚖️",
    examplePrompt: "I have received a formal dispute letter and need a structured explanation of what it requires.",
  },
];

/** Placeholder metadata for result sections (content filled by AI) */
export const RESULT_SECTION_META: Array<{
  id: string;
  title: string;
  description: string;
  icon: string;
  type: ResultSection["type"];
}> = [
  {
    id: "simple_terms",
    title: "In simple terms",
    description: "A plain-language summary of what this means",
    icon: "💡",
    type: "text",
  },
  {
    id: "important_points",
    title: "Important points",
    description: "The key things you should be aware of",
    icon: "📌",
    type: "grounded-list",
  },
  {
    id: "review_points",
    title: "Points to review",
    description: "Areas that may need closer attention",
    icon: "⚠️",
    type: "grounded-list",
  },
  {
    id: "next_steps",
    title: "Possible next steps",
    description: "Actions you may want to consider",
    icon: "➡️",
    type: "list",
  },
  {
    id: "checklist",
    title: "Your checklist",
    description: "Practical items to work through",
    icon: "✅",
    type: "checklist",
  },
  {
    id: "questions",
    title: "Questions for a legal professional",
    description: "What to ask if you seek professional advice",
    icon: "❓",
    type: "list",
  },
  {
    id: "sources",
    title: "Context & sources",
    description: "Background information and references",
    icon: "📚",
    type: "text",
  },
];

export const SITUATION_EXAMPLES = [
  "Understand what a rental agreement clause means",
  "Explain the key terms in my employment contract",
  "What should I check before signing a freelance contract?",
  "A company sent me a legal notice — what does it mean?",
  "What are my rights if a landlord refuses a deposit refund?",
];

export const PASTE_EXAMPLES = [
  "Paste a clause from a contract",
  "Paste a legal notice or letter",
  "Paste a privacy policy section",
  "Paste terms and conditions",
  "Paste a tenancy agreement section",
];

export const DISCLAIMER_TEXT =
  "ClauseLens provides general legal information and educational guidance only. It is not a substitute for advice from a qualified legal professional. Laws and regulations vary by jurisdiction. Always consult a solicitor or lawyer for advice on your specific situation.";
