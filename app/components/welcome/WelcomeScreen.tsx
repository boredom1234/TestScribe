import React from "react";

interface WelcomeScreenProps {
  // Backwards compatibility (not used in the TestCode layout)
  selectedCategory?: any;
  onCategoryChange?: (category: any) => void;
  // Required
  onSuggestionClick: (prompt: string) => void;
  hasMessages: boolean;
  // Framework context mirror (optional but recommended)
  contextSelections?: {
    playwright: boolean;
    selenium: boolean;
    cypress: boolean;
  };
  onToggleContext?: (key: "playwright" | "selenium" | "cypress") => void;
  // Optional: informer for already attached contexts to disable toggles
  isContextAttached?: (key: "playwright" | "selenium" | "cypress") => boolean;
}

export function WelcomeScreen({
  onSuggestionClick,
  hasMessages,
  contextSelections,
  onToggleContext,
  isContextAttached,
}: WelcomeScreenProps) {
  const quickActions: { label: string; prompt: string }[] = [
    {
      label: "Generate E2E test from a user story",
      prompt:
        "Write a Playwright E2E test for user login at https://example.com with 2FA. Include data-testid selectors, robust waits, and clear assertions.",
    },
    {
      label: "Create a Page Object for a page",
      prompt:
        "Create a Selenium Page Object for the product listing page at https://example.com/shop with methods: filterByPrice(min,max), sortBy(option), addToCart(itemName). Use By-test-ids if available.",
    },
    {
      label: "Convert manual steps → automated test",
      prompt:
        "Convert these manual steps into a Cypress test: [paste steps]. Stub network calls to /api/orders and use custom commands when helpful.",
    },
    {
      label: "Add robust selectors/assertions",
      prompt:
        "Given this DOM snippet: [paste DOM], generate stable selectors and assertions for critical elements. Prefer role- or data-testid-based selectors.",
    },
    {
      label: "Fix a flaky test",
      prompt:
        "This test is flaky: [paste test]. Diagnose likely causes and refactor using robust waits, retries (if framework supports), and idempotent assertions.",
    },
    {
      label: "Migrate framework",
      prompt:
        "Migrate this Cypress test to Playwright: [paste test]. Keep equivalent network stubbing, assertions, and fixtures.",
    },
  ];

  const starters: string[] = [
    "Write a Playwright E2E test covering signup, email verification, and first-login tour at https://example.com.",
    "Create a Selenium Page Object for Checkout with methods: fillAddress, applyCoupon, placeOrder. Add explicit waits.",
    "Generate a Cypress spec for cart flows including add/remove items, quantity changes, and totals verification. Stub /prices.",
    "Given this URL and DOM (attached), propose resilient selectors and edge-case assertions.",
  ];

  return (
    <section className="mx-auto mt-8 w-full max-w-6xl text-left rounded-2xl border border-[#e9c7e0] bg-white/70 p-4 sm:p-6 shadow-sm">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-[30px] pb-3 pt-12 text-[#4e2a58]">
        Welcome to TestScribe
      </h1>
      <p className="text-sm text-rose-900/80 mb-4">
        Pick your framework or attach context, then describe what to test.
      </p>

      {/* Framework toggles (mirror top-right menu) */}
      <div className="mb-4 rounded-xl border border-[#e9c7e0] bg-white p-3">
        <div className="mb-2 text-sm font-semibold text-[#8a0254]">
          Framework Contexts{" "}
          <small>
            <sup>
              <span className="text-[#008000]">powered by Context 7</span>
            </sup>
          </small>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                !!contextSelections?.playwright ||
                !!isContextAttached?.("playwright")
              }
              disabled={!!isContextAttached?.("playwright")}
              onChange={() => onToggleContext && onToggleContext("playwright")}
              title={
                isContextAttached?.("playwright")
                  ? "already attached for this thread"
                  : undefined
              }
            />
            <span>Playwright</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                !!contextSelections?.selenium ||
                !!isContextAttached?.("selenium")
              }
              disabled={!!isContextAttached?.("selenium")}
              onChange={() => onToggleContext && onToggleContext("selenium")}
              title={
                isContextAttached?.("selenium")
                  ? "already attached for this thread"
                  : undefined
              }
            />
            <span>Selenium</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                !!contextSelections?.cypress || !!isContextAttached?.("cypress")
              }
              disabled={!!isContextAttached?.("cypress")}
              onChange={() => onToggleContext && onToggleContext("cypress")}
              title={
                isContextAttached?.("cypress")
                  ? "already attached for this thread"
                  : undefined
              }
            />
            <span>Cypress</span>
          </label>
        </div>
        <div className="mt-2 text-[11px] text-gray-500">
          For best results, attach DOM extraction data or enable a framework
          context before prompting.
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {quickActions.map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => onSuggestionClick(prompt)}
            className="rounded-lg border border-[#e9c7e0] bg-white px-4 py-3 text-left text-rose-900/90 transition hover:bg-[#ed78c6]/10"
          >
            {label}
          </button>
        ))}
      </div>

      {!hasMessages && (
        <div className=" mt-5 w-full divide-y divide-rose-100 overflow-hidden rounded-2xl text-left pt-1 align-left">
          {starters.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSuggestionClick(prompt)}
              className="block w-full px-5 py-3 text-left text-rose-900/90 transition hover:bg-[#ed78c6]/20 text-font-10px align-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
