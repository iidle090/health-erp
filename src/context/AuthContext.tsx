import React, { createContext, useContext, useState } from "react";
import { useLocation } from "wouter";

export type UserRole = "admin" | "doctor" | "nurse" | "superadmin" | "lab" | "pharmacy" | "accountant" | "receptionist" | "radiology";

interface AuthUser {
  role: UserRole;
  name: string;
  email: string;
  clinicId?: string;
}
interface AuthContextType {
  user: AuthUser | null;
  login: (role: UserRole, email: string, displayName?: string, clinicId?: string | null) => void;
  updateProfile: (displayName: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const SESSION_KEY = "health_erp_user";

const FALLBACK_NAMES: Record<UserRole, string> = {
  admin: "Admin User", doctor: "Dr. Olivia Patel", nurse: "Nurse Rebecca Mills",
  superadmin: "Super Administrator", lab: "Lab Tech", pharmacy: "Pharmacist",
  accountant: "Accountant", receptionist: "Receptionist", radiology: "Radiologist",
};

const ROLE_ROUTES: Record<UserRole, string> = {
  admin: "/admin-dashboard", doctor: "/doctor-dashboard", nurse: "/nurse-dashboard",
  superadmin: "/superadmin", lab: "/lab", pharmacy: "/pharmacy",
  accountant: "/accountant", receptionist: "/receptionist", radiology: "/radiology",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try { const s = sessionStorage.getItem(SESSION_KEY); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [, navigate] = useLocation();

  const login = (role: UserRole, email: string, displayName?: string, clinicId?: string | null) => {
    const resolvedClinicId = clinicId !== null && clinicId !== undefined ? clinicId : undefined;
    const authUser: AuthUser = {
      role, name: displayName ?? FALLBACK_NAMES[role], email,
      clinicId: role === "superadmin" ? undefined : resolvedClinicId,
    };
    setUser(authUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
    navigate(ROLE_ROUTES[role]);
  };

  const updateProfile = (displayName: string) => {
    if (!user) return;
    const authUser: AuthUser = { ...user, name: displayName.trim() || user.name };
    setUser(authUser);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(authUser));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    navigate("/");
  };

  return <AuthContext.Provider value={{ user, login, updateProfile, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
