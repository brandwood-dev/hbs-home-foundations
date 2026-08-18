import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/**
 * Dialog générique des actions sensibles.
 * Le motif est obligatoire lorsque `requireReason` est vrai : la validation
 * définitive reste appliquée par le repository.
 */
export function AdminOrderActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  requireReason,
  destructive,
  extra,
  isPending,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  requireReason?: boolean;
  destructive?: boolean;
  extra?: ReactNode;
  isPending?: boolean;
  onConfirm: (values: { reason: string; note: string }) => void;
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setNote("");
    }
  }, [open]);

  const reasonMissing = Boolean(requireReason) && reason.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {extra}
          {requireReason ? (
            <div className="space-y-1.5">
              <Label htmlFor="action-reason">
                Motif <span aria-hidden>*</span>
              </Label>
              <Textarea
                id="action-reason"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={2}
                required
                aria-describedby="action-reason-help"
              />
              <p id="action-reason-help" className="text-xs text-muted-foreground">
                Le motif est enregistré dans l'historique de la commande.
              </p>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="action-note">Note interne (optionnelle)</Label>
            <Textarea
              id="action-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={reasonMissing || isPending}
            onClick={() => onConfirm({ reason: reason.trim(), note: note.trim() })}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
