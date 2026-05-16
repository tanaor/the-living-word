import { useState } from "react";
import type { DailyVerse } from "../hooks/useDailyVerse";

interface DailyVerseCardProps {
  verse: DailyVerse | null;
  loading: boolean;
}

function getTodayKey() {
  const now = new Date();
  return `verse_dismissed_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export default function DailyVerseCard({ verse, loading }: DailyVerseCardProps) {
  const [dismissed, setDismissed] = useState(() => !!localStorage.getItem(getTodayKey()));

  function dismiss() {
    localStorage.setItem(getTodayKey(), "1");
    setDismissed(true);
  }

  if (dismissed) return null;

  if (loading) {
    return (
      <div className="mx-4 mt-4 p-4 rounded-2xl bg-amber-100 border border-amber-200 animate-pulse">
        <div className="h-3 bg-amber-200 rounded w-1/3 mb-2" />
        <div className="h-4 bg-amber-200 rounded w-full mb-1" />
        <div className="h-4 bg-amber-200 rounded w-4/5" />
      </div>
    );
  }

  if (!verse) return null;

  return (
    <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 relative">
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-amber-400 hover:text-amber-700 transition-colors"
        aria-label="Dismiss verse"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
        </svg>
      </button>
      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1 pr-5">
        Today's Verse · {verse.verse_reference}
      </p>
      <p className="font-serif text-amber-900 text-sm leading-relaxed mb-2 italic">
        "{verse.verse_text}"
      </p>
      <p className="text-amber-700 text-xs leading-relaxed">
        {verse.reflection}
      </p>
    </div>
  );
}
