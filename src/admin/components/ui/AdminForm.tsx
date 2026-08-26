import { useId, useRef, type ChangeEvent, type ReactNode } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/lib/money/money";

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
  ...base
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  disabled?: boolean;
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
          {value ? (
            <img
              src={value}
              alt=""
              className="size-12 shrink-0 rounded border border-border object-cover"
            />
          ) : null}
        </div>
      </div>
    </FieldWrapper>
  );
}
