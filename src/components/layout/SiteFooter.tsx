"use client";

import { cn } from "@/lib/utils";
import { ClauseLensLogo } from "@/components/ui/ClauseLensLogo";

interface SiteFooterProps {
  onNavigateToUnderstand?: () => void;
  onNavigateToCompare?: () => void;
  className?: string;
}

export function SiteFooter({
  onNavigateToUnderstand,
  onNavigateToCompare,
  className,
}: SiteFooterProps) {
  const scrollToWorkspace = () => {
    const elem = document.getElementById("workspace");
    if (elem) elem.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToSafety = () => {
    const elem = document.getElementById("trust-safety");
    if (elem) elem.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <footer
      className={cn(
        "border-t border-[var(--color-border)] py-7 px-5 sm:px-8 bg-[var(--color-bg)] font-sans",
        className,
      )}
    >
      <div className="max-w-[880px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
        <div className="flex items-center gap-2.5">
          <ClauseLensLogo variant="full" size="sm" />
          <span className="hidden md:inline text-xs text-[var(--color-text-muted)]">
            · Private legal research desk
          </span>
        </div>

        <nav className="flex items-center gap-5 text-xs" aria-label="Footer navigation">
          <button
            type="button"
            onClick={() => {
              if (onNavigateToUnderstand) onNavigateToUnderstand();
              scrollToWorkspace();
            }}
            className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            Understand
          </button>
          <button
            type="button"
            onClick={() => {
              if (onNavigateToCompare) onNavigateToCompare();
              scrollToWorkspace();
            }}
            className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            Compare
          </button>
          <button
            type="button"
            onClick={scrollToSafety}
            className="hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            Legal Boundaries
          </button>
        </nav>

        <p className="text-xs text-center sm:text-right text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} ClauseLens · General information only
        </p>
      </div>
    </footer>
  );
}
