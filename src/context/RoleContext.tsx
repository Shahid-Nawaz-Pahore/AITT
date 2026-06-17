// Demo role context. There is no real auth — a "View as" switcher in the
// Header lets a reviewer preview the app as each role. Default is "public".

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Role } from "../mock/types";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

/** Default landing route for each role (used by the switcher and Sign In). */
export const roleHome: Record<Role, string> = {
  public: "/",
  company: "/company",
  sub_admin: "/expert",
  admin: "/admin",
};

export const roleLabel: Record<Role, string> = {
  public: "Public",
  company: "Company",
  sub_admin: "Sub-Admin",
  admin: "Main Admin",
};

const STORAGE_KEY = "aitt-demo-role";
const VALID_ROLES: Role[] = ["public", "company", "sub_admin", "admin"];

function readStoredRole(): Role {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Role | null;
    if (stored && VALID_ROLES.includes(stored)) return stored;
  } catch {
    // localStorage unavailable — fall through to default.
  }
  return "public";
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role>(readStoredRole);

  const setRole = (next: Role) => {
    setRoleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence failures
    }
  };

  const value = useMemo(() => ({ role, setRole }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
