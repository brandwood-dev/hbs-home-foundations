import { useId, type ReactNode } from "react";
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
    <section className={cn("rounded-lg border border-border bg-card p-4", className)}>
      <header className="mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
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
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[11px] font-medium text-red-600">
          {error}
        </p>
      ) : null}
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
          aria-describedby={base.error ? `${id}-error` : undefined}
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
          aria-describedby={base.error ? `${id}-error` : undefined}
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
  return (
    <FieldWrapper {...base} id={id} {...(selected?.description ? { hint: selected.description } : {})}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id={id} aria-label={base.label}>
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
    <div className="flex items-start justify-between gap-4 rounded-md border border-border px-3 py-2.5">
      <div>
        <Label htmlFor={id} className="text-xs font-medium">
          {label}
        </Label>
        {description ? <p className="text-[11px] text-muted-foreground">{description}</p> : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
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
      hint={base.hint ?? (valueMinor != null ? `${formatMoney(valueMinor)} · ${valueMinor} millimes` : "Montant en DT")}
    >
      <Input
        id={id}
        type="number"
        min={0}
        step="0.001"
        inputMode="decimal"
        disabled={disabled}
        value={display}
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
      <Input id={id} type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </FieldWrapper>
  );
}

/** Référence média par URL — le stockage réel sera connecté au backend. */
export function AdminImageField({
  value,
  onChange,
  ...base
}: BaseFieldProps & { value: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <FieldWrapper {...base} id={id} hint={base.hint ?? "URL d'image ou chemin d'asset local."}>
      <div className="flex gap-3">
        <Input
          id={id}
          value={value}
          placeholder="https://…"
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <img
            src={value}
            alt=""
            className="size-10 shrink-0 rounded border border-border object-cover"
          />
        ) : null}
      </div>
    </FieldWrapper>
  );
}
