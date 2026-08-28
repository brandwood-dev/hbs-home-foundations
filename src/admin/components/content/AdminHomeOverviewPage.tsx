import { ArrowRight, CheckCircle2, Clock3, Image } from "lucide-react";
import { AppLink } from "@/components/ui/app-link";
import { AdminPageHeader } from "@/admin/components/ui/AdminPageHeader";
import {
  AdminCard,
  AdminErrorState,
  AdminSkeleton,
  AdminStatusBadge,
} from "@/admin/components/ui/AdminStates";
import { useAdminHomeContent } from "@/admin/hooks/admin.queries";
import {
  HOME_SECTION_CONFIG,
  getHomeOverviewStatus,
  sectionMeta,
} from "@/admin/components/content/home-overview";

export function AdminHomeOverviewPage() {
  const { data, isLoading, error, refetch } = useAdminHomeContent();

  if (error) {
    return (
      <AdminErrorState
        message="Chargement de la synthèse homepage impossible."
        onRetry={() => void refetch()}
      />
    );
  }

  if (isLoading || !data) return <AdminSkeleton rows={8} />;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Page d’accueil"
        description="Vue d’ensemble des sections administrables de la homepage."
        breadcrumbs={[{ label: "Contenu" }, { label: "Page d’accueil" }]}
        actions={<AdminStatusBadge label="Édition par section" tone="info" />}
      />

      <AdminCard className="border-primary/20 bg-primary/[0.03]">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div>
            <h2 className="text-sm font-semibold">Une section à la fois</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Les modifications et publications sont isolées. Ouvrez uniquement la section à
              modifier pour éviter de transmettre toute la configuration de la homepage.
            </p>
          </div>
        </div>
      </AdminCard>

      <div className="grid gap-4 lg:grid-cols-3">
        {HOME_SECTION_CONFIG.map((section) => {
          const Icon = section.icon;
          const status = getHomeOverviewStatus(data, section.key);
          const meta = sectionMeta(data, section.key);

          return (
            <AdminCard key={section.key} className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <AdminStatusBadge label={status.label} tone={status.tone} />
              </div>
              <h2 className="mt-4 text-base font-semibold">{section.label}</h2>
              <p className="mt-1 min-h-12 text-sm text-muted-foreground">{section.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">{status.detail}</p>
              {meta.length > 0 ? (
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {meta.map((item) => (
                    <li key={item} className="flex items-center gap-1.5">
                      {item.startsWith("Modifiée") ? (
                        <Clock3 className="size-3.5" aria-hidden />
                      ) : (
                        <Image className="size-3.5" aria-hidden />
                      )}
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
              <AppLink
                href={section.href}
                className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Modifier la section
                <ArrowRight className="size-4" aria-hidden />
              </AppLink>
            </AdminCard>
          );
        })}
      </div>
    </div>
  );
}
