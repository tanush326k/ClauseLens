"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClauseLensLogo } from "@/components/ui/ClauseLensLogo";

interface SiteNavbarProps {
  onNavigateToUnderstand?: () => void;
  onNavigateToCompare?: () => void;
  activeMode?: "understand" | "compare";
  className?: string;
}

export function SiteNavbar({
  onNavigateToUnderstand,
  onNavigateToCompare,
  activeMode = "understand",
  className,
}: SiteNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToWorkspace = () => {
    const elem = document.getElementById("workspace");
    if (elem) elem.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToSafety = () => {
    const elem = document.getElementById("trust-safety");
    if (elem) elem.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full",
        "bg-[var(--color-bg)]/95 border-b border-[var(--color-border)]",
        className,
      )}
    >
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Wordmark (Left) */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center group cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-brand)] rounded"
            aria-label="ClauseLens home"
          >
            <ClauseLensLogo variant="full" size="sm" />
          </a>

          {/* Mode Switcher (Center - Desktop) */}
          <nav
            className="hidden sm:flex items-center gap-1 bg-[var(--color-surface)] p-1 rounded-[var(--radius-sm)] border border-[var(--color-border)]"
            aria-label="Primary navigation"
          >
            <button
              type="button"
              onClick={() => {
                if (onNavigateToUnderstand) onNavigateToUnderstand();
                scrollToWorkspace();
              }}
              className={cn(
                "px-3.5 py-1 text-xs rounded-[var(--radius-xs)] transition-colors cursor-pointer font-sans",
                activeMode === "understand"
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-xs font-semibold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-normal",
              )}
            >
              Understand
            </button>
            <button
              type="button"
              onClick={() => {
                if (onNavigateToCompare) onNavigateToCompare();
                scrollToWorkspace();
              }}
              className={cn(
                "px-3.5 py-1 text-xs rounded-[var(--radius-xs)] transition-colors cursor-pointer font-sans",
                activeMode === "compare"
                  ? "bg-[var(--color-bg-card)] text-[var(--color-text-primary)] shadow-xs font-semibold"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-normal",
              )}
            >
              Compare
            </button>
          </nav>

          {/* Boundaries / Trust (Right - Desktop) */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={scrollToSafety}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer px-2 py-1 rounded"
            >
              Legal Boundaries & Safety
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex sm:hidden items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((o) => !o)}
              className="p-1.5 rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface)] transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[var(--color-border)] py-2.5 space-y-2 animate-in">
            <div className="grid grid-cols-2 gap-2 pb-1">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateToUnderstand) onNavigateToUnderstand();
                  scrollToWorkspace();
                }}
                className={cn(
                  "p-2 text-center text-xs rounded border",
                  activeMode === "understand"
                    ? "bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold"
                    : "bg-[var(--color-surface)] border-transparent text-[var(--color-text-secondary)]",
                )}
              >
                Understand
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateToCompare) onNavigateToCompare();
                  scrollToWorkspace();
                }}
                className={cn(
                  "p-2 text-center text-xs rounded border",
                  activeMode === "compare"
                    ? "bg-[var(--color-bg-card)] border-[var(--color-border)] text-[var(--color-text-primary)] font-semibold"
                    : "bg-[var(--color-surface)] border-transparent text-[var(--color-text-secondary)]",
                )}
              >
                Compare
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSafety();
              }}
              className="w-full text-left py-1.5 px-2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            >
              Legal Boundaries & Safety
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
