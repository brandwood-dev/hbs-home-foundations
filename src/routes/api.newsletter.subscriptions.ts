import { createFileRoute } from "@tanstack/react-router";

import { getMarketingRuntimeEnv, handleMarketingRequest } from "@/services/marketing/brevo";

export const Route = createFileRoute("/api/newsletter/subscriptions")({
  server: {
    handlers: {
      POST: async ({ request }) =>
        (await handleMarketingRequest(request, getMarketingRuntimeEnv(request))) ??
        new Response(null, { status: 404 }),
    },
  },
});
