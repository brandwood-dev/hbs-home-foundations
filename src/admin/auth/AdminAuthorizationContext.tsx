import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ApiAdminSession } from "@/api";

interface AdminAuthorizationContextValue {
  session: ApiAdminSession;
  hasPermission(permission: string): boolean;
}

const AdminAuthorizationContext = createContext<AdminAuthorizationContextValue | null>(null);

export function AdminAuthorizationProvider({
  session,
  children,
}: {
  session: ApiAdminSession;
  children: ReactNode;
}) {
  const value = useMemo<AdminAuthorizationContextValue>(() => {
    const permissions = new Set(session.permissions);
    return { session, hasPermission: (permission) => permissions.has(permission) };
  }, [session]);

  return (
    <AdminAuthorizationContext.Provider value={value}>
      {children}
    </AdminAuthorizationContext.Provider>
  );
}

export function useAdminAuthorization(): AdminAuthorizationContextValue {
  const context = useContext(AdminAuthorizationContext);
  if (!context) {
    throw new Error("useAdminAuthorization must be used inside AdminAuthorizationProvider.");
  }
  return context;
}
