import type { DailyVerse } from "../hooks/useDailyVerse";

interface DailyVerseCardProps {
  verse: DailyVerse | null;
  loading: boolean;
}

export default function DailyVerseCard({ verse, loading }: DailyVerseCardProps) {
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
    <div className="mx-4 mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200">
      <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">
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
