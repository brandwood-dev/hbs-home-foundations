interface Option<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export function MeasurementOptionGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  columns = 3,
}: {
  legend: string;
  name: string;
  options: Option<T>[];
  value: T | undefined;
  onChange: (next: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium">{legend}</legend>
      <div
        className={`mt-2 grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}
        role="radiogroup"
        aria-label={legend}
      >
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex min-h-[48px] cursor-pointer flex-col justify-center rounded-sm border px-3 py-2 text-sm transition-colors ${
                selected ? "border-accent bg-accent/10" : "border-border hover:border-taupe"
              }`}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={selected}
                  onChange={() => onChange(option.value)}
                  className="h-4 w-4 accent-[var(--color-accent)]"
                />
                <span className="font-medium">{option.label}</span>
              </span>
              {option.hint ? (
                <span className="mt-1 pl-6 text-xs text-foreground-muted">{option.hint}</span>
              ) : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
