import { useId, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { Check, ChevronDown, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money/money";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import type { AdminColorOption } from "@/admin/config/admin-color-options";

export function AdminFormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5",
        className,
      )}
    >
      <header className="mb-4">
        <h2 className="text-base font-semibold tracking-[-0.01em]">{title}</h2>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

interface BaseFieldProps {
  label: string;
  error?: string | undefined;
  hint?: string;
  required?: boolean;
  className?: string;
}

function FieldWrapper({
  label,
  error,
  hint,
  required,
  id,
  className,
  children,
}: BaseFieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={cn("grid min-w-0 gap-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </Label>
      {children}
      <div className="min-h-4">
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-xs font-medium text-red-600">
            {error}
          </p>
        ) : hint ? (
          <p id={`${id}-hint`} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : (
          <span aria-hidden className="block h-4" />
        )}
      </div>
    </div>
  );
}

export function AdminField({
  value,
  onChange,
  type = "text",
  placeholder,
  multiline,
  rows = 4,
  disabled,
  readOnly,
  ...base
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
  readOnly?: boolean;
}) {
  const id = useId();
  return (
    <FieldWrapper {...base} id={id}>
      {multiline ? (
        <Textarea
          id={id}
          rows={rows}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder ?? ""}
          aria-invalid={Boolean(base.error)}
          aria-describedby={base.error ? `${id}-error` : base.hint ? `${id}-hint` : undefined}
          className="min-h-24 bg-background"
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder ?? ""}
          aria-invalid={Boolean(base.error)}
          aria-describedby={base.error ? `${id}-error` : base.hint ? `${id}-hint` : undefined}
          className="h-10 bg-background"
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </FieldWrapper>
  );
}

/** Éditeur riche contrôlé, partagé par les contenus produits et éditoriaux. */
export function AdminRichTextField({
  value,
  onChange,
  placeholder,
  disabled,
  ...base
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <FieldWrapper {...base} id={id}>
      <RichTextEditor
        id={id}
        value={value}
        onChange={onChange}
        {...(placeholder ? { placeholder } : {})}
        {...(disabled === undefined ? {} : { disabled })}
        {...(base.error ? { className: "border-red-600" } : {})}
      />
    </FieldWrapper>
  );
}

export function AdminSelectField({
  value,
  onChange,
  options,
  disabled,
  ...base
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; description?: string }>;
  disabled?: boolean;
}) {
  const id = useId();
  const selected = options.find((option) => option.value === value);
  const hint = selected?.description ?? base.hint;
  return (
    <FieldWrapper {...base} id={id} {...(hint ? { hint } : {})}>
      <Select value={value} onValueChange={onChange} disabled={disabled ?? false}>
        <SelectTrigger
          id={id}
          className="h-10 bg-background"
          aria-label={base.label}
          aria-invalid={Boolean(base.error)}
          aria-describedby={base.error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        >
          <SelectValue placeholder="Sélectionner" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}

export type { AdminColorOption } from "@/admin/config/admin-color-options";

/** Selecteur de coloris contrôlé, avec aperçu visuel et libellé accessible. */
export function AdminColorSelectField({
  value,
  onChange,
  options,
  disabled,
  ...base
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  options: AdminColorOption[];
  disabled?: boolean;
}) {
  const id = useId();
  const selected = options.find((option) => option.value === value);
  return (
    <FieldWrapper {...base} id={id}>
      <Select value={value} onValueChange={onChange} disabled={disabled ?? false}>
        <SelectTrigger
          id={id}
          className="h-10 bg-background"
          aria-label={base.label}
          aria-invalid={Boolean(base.error)}
          aria-describedby={base.error ? `${id}-error` : base.hint ? `${id}-hint` : undefined}
        >
          {selected ? (
            <span className="flex min-w-0 items-center gap-2 truncate">
              <span
                aria-hidden
                className="size-4 shrink-0 rounded-full border border-black/15"
                style={{ backgroundColor: selected.hex ?? "#d6d3d1" }}
              />
              <span className="truncate">{selected.label}</span>
            </span>
          ) : (
            <SelectValue placeholder="Sélectionner" />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-4 rounded-full border border-black/15"
                  style={{ backgroundColor: option.hex ?? "#d6d3d1" }}
                />
                {option.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}

/** Dropdown multi-sélection compact, réutilisable pour les attributs à choix multiples. */
export function AdminMultiSelectField({
  value,
  onChange,
  options,
  ...base
}: BaseFieldProps & {
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const id = useId();
  const selected = new Set(value);
  const [open, setOpen] = useState(false);
  const selectedOptions = options.filter((option) => selected.has(option.value));

  function toggleOption(optionValue: string) {
    const next = new Set(selected);
    if (next.has(optionValue)) next.delete(optionValue);
    else next.add(optionValue);
    onChange([...next]);
  }

  return (
    <FieldWrapper {...base} id={id}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            id={id}
            role="combobox"
            tabIndex={0}
            aria-label={base.label}
            aria-expanded={open}
            aria-haspopup="listbox"
            aria-controls={`${id}-options`}
            className="flex min-h-10 w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-left text-sm shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setOpen((current) => !current);
              }
            }}
          >
            <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                  >
                    <span className="min-w-0 truncate">{option.label}</span>
                    <button
                      type="button"
                      aria-label={`Supprimer ${option.label}`}
                      className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleOption(option.value);
                      }}
                    >
                      <X className="size-3" aria-hidden="true" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-muted-foreground">Sélectionner…</span>
              )}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </div>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--radix-popover-trigger-width)] min-w-52 p-1"
        >
          <div
            id={`${id}-options`}
            role="listbox"
            aria-label={base.label}
            aria-multiselectable="true"
            className="max-h-60 overflow-y-auto"
          >
            {options.length > 0 ? (
              options.map((option) => {
                const isSelected = selected.has(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className="flex min-h-10 w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                    onClick={() => toggleOption(option.value)}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-sm border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background",
                      )}
                    >
                      {isSelected ? <Check className="size-3" /> : null}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </button>
                );
              })
            ) : (
              <p className="px-2 py-3 text-sm text-muted-foreground">Aucune option disponible.</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}

export function AdminSwitchField({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <FieldWrapper {...(description ? { hint: description } : {})} label={label} id={id}>
      <div className="flex h-10 items-center justify-end rounded-md border border-input bg-background px-3">
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          {...(description ? { "aria-describedby": `${id}-hint` } : {})}
        />
      </div>
    </FieldWrapper>
  );
}

/** Saisie en DT, stockage en millimes. */
export function AdminMoneyField({
  valueMinor,
  onChange,
  disabled,
  ...base
}: BaseFieldProps & {
  valueMinor: number | undefined;
  onChange: (valueMinor: number | undefined) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const display = valueMinor == null ? "" : String(valueMinor / 1000);
  return (
    <FieldWrapper
      {...base}
      id={id}
      hint={
        base.hint ??
        (valueMinor != null
          ? `${formatMoney(valueMinor)} · ${valueMinor} millimes`
          : "Montant en DT")
      }
    >
      <Input
        id={id}
        type="number"
        min={0}
        step="0.001"
        inputMode="decimal"
        disabled={disabled}
        value={display}
        className="h-10 bg-background"
        aria-invalid={Boolean(base.error)}
        onChange={(event) => {
          const raw = event.target.value;
          onChange(raw === "" ? undefined : Math.round(Number(raw) * 1000));
        }}
      />
    </FieldWrapper>
  );
}

export function AdminNumberField({
  value,
  onChange,
  min = 0,
  disabled,
  ...base
}: BaseFieldProps & {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <FieldWrapper {...base} id={id}>
      <Input
        id={id}
        type="number"
        min={min}
        value={Number.isFinite(value) ? value : 0}
        disabled={disabled}
        className="h-10 bg-background"
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </FieldWrapper>
  );
}

/** Champ numérique optionnel : vide tant qu'aucune valeur n'est renseignée. */
export function AdminOptionalNumberField({
  value,
  onChange,
  min = 0,
  placeholder = "—",
  disabled,
  ...base
}: BaseFieldProps & {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  min?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  const id = useId();
  return (
    <FieldWrapper {...base} id={id}>
      <Input
        id={id}
        type="number"
        min={min}
        value={typeof value === "number" && Number.isFinite(value) ? value : ""}
        placeholder={placeholder}
        disabled={disabled}
        className="h-10 bg-background"
        aria-invalid={Boolean(base.error)}
        onChange={(event) => {
          const raw = event.target.value.trim();
          onChange(raw === "" ? undefined : Number(raw));
        }}
      />
    </FieldWrapper>
  );
}

export function AdminDateField({
  value,
  onChange,
  ...base
}: BaseFieldProps & { value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <FieldWrapper {...base} id={id}>
      <Input
        id={id}
        type="date"
        value={value}
        className="h-10 bg-background"
        onChange={(event) => onChange(event.target.value)}
      />
    </FieldWrapper>
  );
}

/** Référence média par URL, avec téléversement optionnel via l’API Admin. */
export function AdminImageField({
  value,
  onChange,
  onUpload,
  isUploading = false,
  uploadError,
  ...base
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  onUpload?: (file: File) => void | Promise<void>;
  isUploading?: boolean;
  uploadError?: string | null;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const getSafeImageSrc = (rawValue: string): string | null => {
    const trimmed = rawValue.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../")) {
      return trimmed;
    }
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") {
        return parsed.toString();
      }
    } catch {
      return null;
    }
    return null;
  };
  const safeImageSrc = getSafeImageSrc(value);
  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file && onUpload) void onUpload(file);
  };
  return (
    <FieldWrapper
      {...base}
      id={id}
      error={uploadError ?? base.error}
      hint={base.hint ?? "Téléversez une image ou indiquez une URL externe."}
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <Input
          id={id}
          value={value}
          placeholder="https://…"
          className="h-10 bg-background"
          onChange={(event) => onChange(event.target.value)}
        />
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleUpload}
          />
          {onUpload ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-1.5 size-4" />
              {isUploading ? "Téléversement…" : "Téléverser"}
            </Button>
          ) : null}
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Supprimer l’image"
              onClick={() => onChange("")}
            >
              <X className="size-4" />
            </Button>
          ) : null}
          {safeImageSrc ? <span className="text-xs text-muted-foreground">Image prête</span> : null}
        </div>
      </div>
    </FieldWrapper>
  );
}
