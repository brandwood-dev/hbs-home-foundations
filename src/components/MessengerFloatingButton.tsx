import { MessageCircle } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { trackEvent } from "@/lib/analytics/analytics";
import { buildMessengerUrl, messengerPageContext } from "@/lib/messenger/messenger-link";

export function MessengerFloatingButton() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { data: storeSettings } = useStoreSettings();

  if (pathname.startsWith("/admin") || pathname.startsWith("/commande/confirmation")) {
    return null;
  }

  const href = buildMessengerUrl(storeSettings.social.facebook, pathname);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contacter HBS HOME sur Messenger"
      title="Une question ? Écrivez-nous sur Messenger"
      onClick={() => trackEvent("messenger_click", { page: messengerPageContext(pathname) })}
      className="group fixed right-3 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex min-h-12 min-w-12 items-center justify-center rounded-full bg-[#0084ff] px-3 text-white shadow-soft transition-transform hover:scale-105 hover:bg-[#0078e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:right-4 lg:bottom-4"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only sm:ml-2 sm:text-sm sm:font-medium">
        Une question ?
      </span>
    </a>
  );
}
