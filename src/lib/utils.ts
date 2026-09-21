// ============================================================
// ClauseLens — cn() utility (classname merging)
// Lightweight alternative to clsx — no extra dependency needed
// ============================================================

/** Merge class names, filtering falsy values */
export function cn(...classes: (string | undefined | null | false | 0)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Truncate text to a maximum character count */
export function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + "…";
}

/** Format a Date to a human-readable relative time string */
export function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}

/** Count approximate word count of a string */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Generate a simple unique ID for client-side use only */
export function generateId(prefix = "cl"): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
