import type { AdminOrderEvent } from "@/admin/types/admin.types";
import { formatDateTime } from "@/admin/utils/admin.utils";

/** Historique append-only : jamais modifié, jamais supprimé. */
export function AdminOrderTimeline({ events }: { events: AdminOrderEvent[] }) {
  const ordered = [...events].sort((a, b) => b.at.localeCompare(a.at));
  if (ordered.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucun évènement enregistré.</p>;
  }
  return (
    <ol className="space-y-3">
      {ordered.map((event) => (
        <li key={event.id} className="border-l-2 border-border pl-3">
          <p className="text-sm font-medium">{event.label}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(event.at)}
            {event.userName ? ` — ${event.userName}` : ""}
          </p>
          {event.summary ? <p className="mt-1 text-xs">{event.summary}</p> : null}
          {event.reason ? <p className="mt-1 text-xs">Motif : {event.reason}</p> : null}
          {event.note ? <p className="mt-1 text-xs text-muted-foreground">{event.note}</p> : null}
        </li>
      ))}
    </ol>
  );
}
