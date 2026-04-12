import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type StaffRole = "admin" | "doctor" | "nurse" | "superadmin" | "lab" | "pharmacy" | "accountant" | "receptionist" | "radiology";

export interface StaffAccount {
  id: string;
  email: string;
  role: StaffRole;
  displayName: string;
  password: string;
  mustChangePassword: boolean;
  tempPasswordLabel?: string;
  createdAt: string;
  createdBy: string;
  lastLoginAt?: string;
  specialty?: string;
  department?: string;
  phone?: string;
  clinicId?: string;
  availability?: "Available" | "Unavailable" | "On Leave";
  shift?: "Morning" | "Afternoon" | "Night";
}

export const SUPER_ADMIN_EMAIL = "super@hospital.com";
export const SUPER_ADMIN_MASTER_PW = "SuperAdmin@2026";

/* ── Module-level in-memory cache (populated after first API fetch) ─────── */
let _accountsCache: StaffAccount[] = [];

function apiToLocal(a: {
  id: string; email: string; role: string; displayName: string;
  mustChangePassword: boolean; clinicId?: string; createdBy?: string;
  availability?: string; shift?: string; lastLogin?: string; createdAt?: string;
}): StaffAccount {
  return {
    id: a.id, email: a.email, role: a.role as StaffRole, displayName: a.displayName,
    password: "", mustChangePassword: a.mustChangePassword,
    clinicId: a.clinicId, createdBy: a.createdBy ?? "system",
    availability: (a.availability as StaffAccount["availability"]) ?? "Available",
    shift: (a.shift as StaffAccount["shift"]) ?? "Morning",
    lastLoginAt: a.lastLogin,
    createdAt: a.createdAt ?? new Date().toISOString().split("T")[0],
  };
}

async function apiFetchAccounts(): Promise<StaffAccount[]> {
  const res = await fetch("/api/staff-accounts");
  if (!res.ok) throw new Error("Failed to fetch staff accounts");
  const data: Parameters<typeof apiToLocal>[0][] = await res.json();
  const accounts = data.map(apiToLocal);
  _accountsCache = accounts;
  return accounts;
}

/* ── Backward-compat synchronous helpers (reads in-memory cache) ─────────── */
export function getAccounts(): StaffAccount[] { return _accountsCache; }

export function findByEmail(email: string): StaffAccount | undefined {
  return _accountsCache.find(a => a.email.toLowerCase() === email.toLowerCase());
}

export function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$";
  let pw = "";
  for (let i = 0; i < 8; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  pw += special[Math.floor(Math.random() * special.length)];
  pw += Math.floor(Math.random() * 90 + 10);
  return pw.split("").sort(() => Math.random() - 0.5).join("");
}

/* ── React hook ─────────────────────────────────────────────────────────── */
export function useStaffAccounts() {
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery<StaffAccount[]>({
    queryKey: ["staff-accounts"],
    queryFn: apiFetchAccounts,
    staleTime: 30_000,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["staff-accounts"] });

  const createMutation = useMutation({
    mutationFn: async (data: {
      email: string; role: StaffRole; displayName: string;
      tempPassword: string; createdBy: string;
      specialty?: string; department?: string; phone?: string;
      clinicId?: string; availability?: StaffAccount["availability"];
      shift?: StaffAccount["shift"];
    }) => {
      const id = `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const res = await fetch("/api/staff-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id, email: data.email, role: data.role, displayName: data.displayName,
          tempPassword: data.tempPassword, clinicId: data.clinicId ?? null,
          createdBy: data.createdBy, availability: data.availability ?? "Available",
          shift: data.shift ?? "Morning",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create account");
      }
      return apiToLocal(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-accounts"] }),
  });

  const resetMutation = useMutation({
    mutationFn: async ({ email, newTempPw, resetBy }: { email: string; newTempPw: string; resetBy: string }) => {
      const account = _accountsCache.find(a => a.email.toLowerCase() === email.toLowerCase());
      if (!account) throw new Error("Account not found");
      const res = await fetch(`/api/staff-accounts/${account.id}/reset-password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: newTempPw, resetBy }),
      });
      if (!res.ok) throw new Error("Failed to reset password");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-accounts"] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/staff-accounts/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-accounts"] }),
  });

  const create = (data: Parameters<typeof createMutation.mutateAsync>[0]) =>
    createMutation.mutateAsync(data);

  const reset = (email: string, newTempPw: string, resetBy: string) =>
    resetMutation.mutateAsync({ email, newTempPw, resetBy });

  const remove = (id: string) => removeMutation.mutateAsync(id);

  const update = async (id: string, _patch: Partial<StaffAccount>) => {
    refresh();
    return true;
  };

  return { accounts, isLoading, refresh, create, reset, remove, update };
}
