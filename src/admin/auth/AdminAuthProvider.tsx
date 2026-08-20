import type { AuthError, Session, SupabaseClient } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseBrowserClient } from "@/auth/supabase-browser";

type AdminAuthStatus = "loading" | "authenticated" | "unauthenticated" | "unconfigured";

interface AdminAuthContextValue {
  client: SupabaseClient | null;
  session: Session | null;
  status: AdminAuthStatus;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  refreshSession(): Promise<void>;
  updatePassword(password: string): Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<AdminAuthStatus>("loading");

  const hydrateSessionFromHash = useCallback(async (supabase: SupabaseClient) => {
    if (typeof window === "undefined") return;
    const query = new URLSearchParams(window.location.search);
    const code = query.get("code");
    if (code) {
      const { data, error }: { data: { session: Session | null }; error: AuthError | null } =
        await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.warn(
          "Impossible de rétablir la session Supabase depuis le code de callback:",
          error.message,
        );
      }

      return data.session;
    }

    const hash = window.location.hash;
    if (!hash.includes("access_token=") || !hash.includes("refresh_token=")) return;

    const params = new URLSearchParams(hash.substring(1));
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) return;

    const { data, error }: { data: { session: Session | null }; error: AuthError | null } =
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

    if (error) {
      console.warn(
        "Impossible de restaurer la session Supabase depuis le lien de reset:",
        error.message,
      );
    }

    return data.session;
  }, []);

  useEffect(() => {
    let supabase: SupabaseClient | null;
    try {
      supabase = getSupabaseBrowserClient();
      setClient(supabase);
    } catch (error) {
      setClient(null);
      console.error(
        "Impossible d’initialiser Supabase Auth :",
        error instanceof Error ? error.message : error,
      );
      setStatus("unconfigured");
      return;
    }

    if (!supabase) {
      setStatus("unconfigured");
      return;
    }

    let active = true;
    void (async () => {
      let restoredSession: Session | null | undefined;
      try {
        restoredSession = await hydrateSessionFromHash(supabase);
      } catch (error) {
        console.warn(
          "Erreur lors de la restauration de session depuis l’URL:",
          error instanceof Error ? error.message : error,
        );
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        setSession(null);
        setStatus("unauthenticated");
        return;
      }
      const sessionFromAuth = data.session ?? restoredSession ?? null;
      setSession(sessionFromAuth);
      setStatus(sessionFromAuth ? "authenticated" : "unauthenticated");
    })();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [hydrateSessionFromHash]);

  const requireClient = useCallback((): SupabaseClient => {
    if (!client) throw new Error("Supabase Auth n’est pas configuré pour cet environnement.");
    return client;
  }, [client]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await requireClient().auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
    },
    [requireClient],
  );

  const signOut = useCallback(async () => {
    const { error } = await requireClient().auth.signOut({ scope: "local" });
    if (error) throw error;
  }, [requireClient]);

  const refreshSession = useCallback(async () => {
    const { data, error } = await requireClient().auth.refreshSession();
    if (error) throw error;
    setSession(data.session);
  }, [requireClient]);

  const updatePassword = useCallback(
    async (password: string) => {
      const { error } = await requireClient().auth.updateUser({ password });
      if (error) throw error;
    },
    [requireClient],
  );

  const value = useMemo<AdminAuthContextValue>(
    () => ({ client, session, status, signIn, signOut, refreshSession, updatePassword }),
    [client, refreshSession, session, signIn, signOut, status, updatePassword],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used inside AdminAuthProvider.");
  return context;
}
