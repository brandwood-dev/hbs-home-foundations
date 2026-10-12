import { useEffect, useRef } from "react";
import { Bold, Eraser, Italic, Link as LinkIcon, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { sanitizeRichTextHtml, toRichTextHtml } from "@/lib/content/rich-text";

type Command = "bold" | "italic" | "insertUnorderedList" | "insertOrderedList" | "removeFormat";

export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder = "Saisissez ou collez votre contenu…",
  disabled = false,
  className,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || document.activeElement === editor) return;
    if (lastValueRef.current === value && (editor.innerHTML || !value)) return;
    editor.innerHTML = toRichTextHtml(value);
    lastValueRef.current = value;
  }, [value]);

  function emitValue() {
    const editor = editorRef.current;
    if (!editor) return;
    const next = sanitizeRichTextHtml(editor.innerHTML);
    lastValueRef.current = next;
    onChange(next);
  }

  function runCommand(command: Command) {
    if (disabled) return;
    editorRef.current?.focus();
    document.execCommand(command, false);
    emitValue();
  }

  function insertLink() {
    if (disabled) return;
    const href = window.prompt("URL du lien", "https://");
    if (!href?.trim()) return;
    editorRef.current?.focus();
    document.execCommand("createLink", false, href.trim());
    emitValue();
  }

  return (
    <div className={cn("overflow-hidden rounded-md border border-input bg-background", className)}>
      <div
        className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/30 p-1.5"
        role="toolbar"
        aria-label="Mise en forme"
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            runCommand("bold");
          }}
          aria-label="Gras"
        >
          <Bold className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            runCommand("italic");
          }}
          aria-label="Italique"
        >
          <Italic className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            runCommand("insertUnorderedList");
          }}
          aria-label="Liste à puces"
        >
          <List className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            runCommand("insertOrderedList");
          }}
          aria-label="Liste numérotée"
        >
          <ListOrdered className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            insertLink();
          }}
          aria-label="Ajouter un lien"
        >
          <LinkIcon className="size-4" aria-hidden />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={disabled}
          onMouseDown={(event) => {
            event.preventDefault();
            runCommand("removeFormat");
          }}
          aria-label="Effacer la mise en forme"
        >
          <Eraser className="size-4" aria-hidden />
        </Button>
      </div>
      <div
        ref={editorRef}
        id={id}
        role="textbox"
        aria-multiline="true"
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="rich-text-editor min-h-28 px-3 py-2 text-sm leading-6 outline-none empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
        onInput={emitValue}
        onBlur={emitValue}
      />
    </div>
  );
}
