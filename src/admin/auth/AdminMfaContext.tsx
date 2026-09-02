import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { HbsApiError } from "@/api";
import { AdminMfaChallenge } from "@/admin/components/auth/AdminMfaChallenge";

interface AdminMfaContextValue {
  requireMfa(): Promise<void>;
}

interface PendingVerification {
  resolve: () => void;
  reject: (reason?: unknown) => void;
}

const AdminMfaContext = createContext<AdminMfaContextValue | null>(null);

export function isMfaRequiredError(error: unknown): error is HbsApiError {
  return error instanceof HbsApiError && error.problem?.code === "MFA_REQUIRED";
}

/**
 * Provides an on-demand MFA step-up without unmounting the current Admin page.
 * Mutations can await requireMfa(), while the challenge is rendered as an
 * overlay so an in-progress form keeps all of its local state.
 */
export function AdminMfaProvider({
  client,
  onVerified,
  children,
}: {
  client: SupabaseClient;
  onVerified: () => Promise<void>;
  children: ReactNode;
}) {
  const [challengeOpen, setChallengeOpen] = useState(false);
  const pendingRef = useRef<PendingVerification | null>(null);
  const activeRequestRef = useRef<Promise<void> | null>(null);

  const finishRequest = useCallback(() => {
    pendingRef.current = null;
    activeRequestRef.current = null;
    setChallengeOpen(false);
  }, []);

  const requireMfa = useCallback((): Promise<void> => {
    const activeRequest = activeRequestRef.current;
    if (activeRequest) return activeRequest;

    const request = new Promise<void>((resolve, reject) => {
      pendingRef.current = { resolve, reject };
      setChallengeOpen(true);
    });
    const trackedRequest = request.then(
      () => {
        finishRequest();
      },
      (reason: unknown) => {
        finishRequest();
        throw reason;
      },
    );
    activeRequestRef.current = trackedRequest;
    return trackedRequest;
  }, [finishRequest]);

  const handleVerified = useCallback(async () => {
    try {
      await onVerified();
      pendingRef.current?.resolve();
    } catch (reason) {
      pendingRef.current?.reject(reason);
    }
  }, [onVerified]);

  const handleCancelled = useCallback(() => {
    pendingRef.current?.reject(new Error("Vérification MFA annulée."));
  }, []);

  useEffect(
    () => () => {
      pendingRef.current?.reject(new Error("La vérification MFA a été interrompue."));
      pendingRef.current = null;
      activeRequestRef.current = null;
    },
    [],
  );

  const value = useMemo<AdminMfaContextValue>(() => ({ requireMfa }), [requireMfa]);

  return (
    <AdminMfaContext.Provider value={value}>
      {children}
      {challengeOpen ? (
        <div
          className="fixed inset-0 z-[100] overflow-y-auto bg-background/95 px-4 py-10 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Vérification de sécurité"
        >
          <AdminMfaChallenge
            client={client}
            onVerified={handleVerified}
            onCancelled={handleCancelled}
          />
        </div>
      ) : null}
    </AdminMfaContext.Provider>
  );
}

export function useAdminMfaOptional(): AdminMfaContextValue | null {
  return useContext(AdminMfaContext);
}
