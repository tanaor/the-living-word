interface SuggestionChipsProps {
  chips: string[];
  onSelect: (chip: string) => void;
  disabled?: boolean;
}

export default function SuggestionChips({ chips, onSelect, disabled }: SuggestionChipsProps) {
  if (chips.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 px-1 mb-3 -mx-1">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => onSelect(chip)}
          disabled={disabled}
          className="flex-shrink-0 w-40 text-left rounded-xl border border-amber-200 bg-white
                     p-3 shadow-sm hover:border-amber-400 active:scale-95 transition-all
                     disabled:opacity-50"
        >
          <span className="block font-serif text-amber-500 text-lg mb-2">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span className="block text-amber-900 text-sm leading-snug">{chip}</span>
          <span className="block text-amber-500 text-right mt-1">→</span>
        </button>
      ))}
    </div>
  );
}
