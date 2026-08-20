import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;
let lastInitializationError: string | null = null;

export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (browserClient !== undefined) return browserClient;

  const url = import.meta.env["VITE_SUPABASE_URL"]?.trim();
  const publishableKey = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]?.trim();
  const queryHasCode = typeof window !== "undefined" && window.location.search.includes("code=");
  const detectedFlow: "pkce" | "implicit" = queryHasCode ? "pkce" : "implicit";
  if (!url || !publishableKey) {
    lastInitializationError = "VITE_SUPABASE_URL ou VITE_SUPABASE_PUBLISHABLE_KEY manquante.";
    browserClient = null;
    return browserClient;
  }

  try {
    browserClient = createClient(url, publishableKey, {
      auth: {
        autoRefreshToken: true,
        // Auth callback routes restore the code/hash explicitly. Disabling
        // the automatic URL detector prevents a second exchange/setSession
        // racing with the callback component.
        detectSessionInUrl: false,
        flowType: detectedFlow,
        persistSession: true,
      },
    });
    lastInitializationError = null;
    return browserClient;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    lastInitializationError = `Impossible d'initialiser Supabase Auth: ${reason}`;
    browserClient = null;
    return browserClient;
  }
}

export function getSupabaseBrowserClientInitError(): string | null {
  return lastInitializationError;
}
