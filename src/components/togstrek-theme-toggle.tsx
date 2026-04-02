"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getTogstrekThemeFromDocument,
  isTogstrekThemePreference,
  TOGSTREK_THEME_STORAGE_KEY,
  type TogstrekThemePreference,
} from "@/lib/togstrek-theme";

type TogstrekThemeToggleProps = {
  className?: string;
};

function getStoredPreference(): TogstrekThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const raw = window.localStorage.getItem(TOGSTREK_THEME_STORAGE_KEY);
    if (!raw) return "system";
    return isTogstrekThemePreference(raw) ? raw : "system";
  } catch {
    return "system";
  }
}

function setStoredPreference(pref: TogstrekThemePreference): void {
  try {
    if (pref === "system") {
      window.localStorage.removeItem(TOGSTREK_THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(TOGSTREK_THEME_STORAGE_KEY, pref);
    }
  } catch {
    /* ignore */
  }
}

function applyPreferenceToDocument(pref: TogstrekThemePreference): void {
  if (pref === "system") {
    document.documentElement.removeAttribute("data-theme");
    return;
  }
  document.documentElement.setAttribute("data-theme", pref);
}

function nextPreference(current: TogstrekThemePreference): TogstrekThemePreference {
  return current === "dark" ? "light" : "dark";
}

export function TogstrekThemeToggle({ className }: TogstrekThemeToggleProps) {
  const [pref, setPref] = useState<TogstrekThemePreference>("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPref(getStoredPreference());
    setHydrated(true);
  }, []);

  const effective = useMemo(() => {
    if (!hydrated) return "system";
    const fromDoc = getTogstrekThemeFromDocument();
    return pref === "system" ? fromDoc : pref;
  }, [hydrated, pref]);

  const label =
    effective === "dark"
      ? "Theme: Dark"
      : effective === "light"
        ? "Theme: Light"
        : "Theme: System";

  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-pressed={effective === "dark"}
      onClick={() => {
        const current = pref === "system" ? getTogstrekThemeFromDocument() : pref;
        const next = nextPreference(current);
        setPref(next);
        setStoredPreference(next);
        applyPreferenceToDocument(next);
      }}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden className="inline-flex items-center gap-2">
        <span className="font-tt-display text-[length:0.72rem] font-semibold uppercase tracking-[var(--tt-tracking-wide)]">
          {effective === "dark" ? "Dark" : "Light"}
        </span>
        <span
          className={`relative inline-flex h-5 w-9 items-center rounded-full border border-tt-border-default/60 ${
            effective === "dark" ? "bg-tt-accent/25" : "bg-tt-surface-muted"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-3.5 w-3.5 rounded-full bg-tt-surface-base shadow-sm transition-transform duration-[var(--tt-duration-fast)] ${
              effective === "dark" ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </span>
      </span>
    </button>
  );
}

