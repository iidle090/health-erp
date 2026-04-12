import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAccounts } from "@/context/StaffAccountStore";

export interface Clinic {
  id: string; name: string; address: string; phone: string; email: string; admin: string;
  status: "Active" | "Trial" | "Suspended"; created: string;
  labEnabled: boolean; pharmacyEnabled: boolean; inventoryEnabled: boolean;
}

export interface ClinicUser {
  id: string; clinicId: string; name: string; email: string;
  role: "Doctor" | "Nurse" | "Admin" | "Lab" | "Pharmacy" | "Accountant" | "Receptionist";
  status: "Active" | "Inactive"; lastLogin: string;
}

interface SuperAdminContextType {
  clinics: Clinic[];
  isLoading: boolean;
  users: ClinicUser[];
  addClinic: (c: Clinic) => Promise<void>;
  updateClinic: (id: string, u: Partial<Clinic>) => Promise<void>;
  removeClinic: (id: string) => Promise<void>;
  addUser: (u: ClinicUser) => void;
  updateUser: (id: string, u: Partial<ClinicUser>) => void;
  removeUser: (id: string) => void;
  getUsersForClinic: (clinicId: string) => ClinicUser[];
  getDoctorCount: (clinicId: string) => number;
  getNurseCount: (clinicId: string) => number;
}

const SuperAdminContext = createContext<SuperAdminContextType | null>(null);

async function fetchClinics(): Promise<Clinic[]> {
  const res = await fetch("/api/clinics");
  if (!res.ok) throw new Error("Failed to fetch clinics");
  const data = await res.json();
  return data.map((c: Clinic) => ({
    ...c,
    status: (c.status as string) as Clinic["status"],
    labEnabled: Boolean(c.labEnabled),
    pharmacyEnabled: Boolean(c.pharmacyEnabled),
    inventoryEnabled: Boolean(c.inventoryEnabled),
  }));
}

export function SuperAdminProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data: clinics = [], isLoading } = useQuery<Clinic[]>({
    queryKey: ["clinics"],
    queryFn: fetchClinics,
    staleTime: 30_000,
  });

  const addClinicMutation = useMutation({
    mutationFn: async (c: Clinic) => {
      const res = await fetch("/api/clinics", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(c),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to add clinic");
      }
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clinics"] }),
  });

  const updateClinicMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Clinic> }) => {
      const res = await fetch(`/api/clinics/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update clinic");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clinics"] }),
  });

  const removeClinicMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/clinics/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clinics"] }),
  });

  const addClinic = useCallback(async (c: Clinic) => {
    await addClinicMutation.mutateAsync(c);
  }, [addClinicMutation]);

  const updateClinic = useCallback(async (id: string, u: Partial<Clinic>) => {
    await updateClinicMutation.mutateAsync({ id, patch: u });
  }, [updateClinicMutation]);

  const removeClinic = useCallback(async (id: string) => {
    await removeClinicMutation.mutateAsync(id);
  }, [removeClinicMutation]);

  const getDoctorCount = useCallback((clinicId: string) =>
    getAccounts().filter((a) => a.clinicId === clinicId && a.role === "doctor").length, []);
  const getNurseCount = useCallback((clinicId: string) =>
    getAccounts().filter((a) => a.clinicId === clinicId && a.role === "nurse").length, []);

  const addUser = useCallback(() => {}, []);
  const updateUser = useCallback(() => {}, []);
  const removeUser = useCallback(() => {}, []);
  const getUsersForClinic = useCallback(() => [], []);

  return (
    <SuperAdminContext.Provider value={{
      clinics, isLoading, users: [],
      addClinic, updateClinic, removeClinic,
      addUser, updateUser, removeUser, getUsersForClinic,
      getDoctorCount, getNurseCount,
    }}>
      {children}
    </SuperAdminContext.Provider>
  );
}

export function useSuperAdmin() {
  const ctx = useContext(SuperAdminContext);
  if (!ctx) throw new Error("useSuperAdmin must be within SuperAdminProvider");
  return ctx;
}
