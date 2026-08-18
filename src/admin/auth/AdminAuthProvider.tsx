import type { Session, SupabaseClient } from "@supabase/supabase-js";
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

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    setClient(supabase);
    if (!supabase) {
      setStatus("unconfigured");
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setSession(null);
        setStatus("unauthenticated");
        return;
      }
      setSession(data.session);
      setStatus(data.session ? "authenticated" : "unauthenticated");
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) return;
      setSession(nextSession);
      setStatus(nextSession ? "authenticated" : "unauthenticated");
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

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
