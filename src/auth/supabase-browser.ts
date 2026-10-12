import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null | undefined;
let lastInitializationError: string | null = null;

const ADMIN_AUTH_LOCK_NAME = "hbs-home-admin-auth";

/**
 * Serialize auth reads/refreshes across duplicated browser windows. Supabase
 * refresh tokens are single-use, so two tabs must never rotate the same token
 * at the same time. Chrome, Edge and current Safari/Firefox expose Web Locks;
 * older browsers still use the normal Supabase behavior as a safe fallback.
 */
export async function withSupabaseAuthLock<T>(operation: () => Promise<T>): Promise<T> {
  if (typeof navigator === "undefined" || !navigator.locks) return operation();

  let enteredLock = false;
  try {
    return await navigator.locks.request(ADMIN_AUTH_LOCK_NAME, { mode: "exclusive" }, async () => {
      enteredLock = true;
      return operation();
    });
  } catch (error) {
    // Do not run the operation twice when the callback itself failed. The
    // fallback is only for browsers that expose a broken LockManager.
    if (enteredLock) throw error;
    return operation();
  }
}

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
        // Admin access is refreshed on demand while holding the cross-tab
        // lock above. Disabling the background ticker avoids two duplicated
        // windows racing to rotate the same single-use refresh token.
        autoRefreshToken: false,
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
