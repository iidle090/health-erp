import React, { createContext, useContext, useState, useCallback } from "react";

export type VitalStatus = "critical" | "warning" | "normal";
export type AdmissionStatus = "Admitted" | "Observation" | "Discharged" | "Transferred";

export interface Vitals {
  bp: string; heartRate: string; temperature: string; oxygen: string;
  respiratoryRate: string; weight: string; height: string; bmi: string;
  recordedAt: string; vitalStatus: VitalStatus;
}

export interface Prescription {
  medication: string; dosage: string; frequency: string; route: string;
  date: string; due: string; status: "Due" | "Administered" | "Overdue";
}

export interface LabResult {
  test: string; value: string; status: "Normal" | "Abnormal" | "Critical";
  date: string; pending?: boolean;
}

export interface NurseTask {
  task: string; priority: "urgent" | "normal"; completed: boolean; time: string;
}

export interface SharedPatient {
  id: string;
  name: string;
  age: number;
  gender: string;
  dob: string;
  bloodType: string;
  condition: string;
  lastVisit: string;
  status: string;
  contact: string;
  bedNumber: string;
  roomNumber: string;
  admissionStatus: AdmissionStatus;
  isolationStatus: string;
  allergies: string[];
  vitals: Vitals;
  prescriptions: Prescription[];
  labResults: LabResult[];
  tasks: NurseTask[];
  notes: string;
  registeredBy: "nurse" | "receptionist" | "system";
  clinicId?: string; // clinic isolation — patients only visible within their clinic
}

// v2: no sample patients — clean slate with clinic isolation
const STORE_KEY = "health_erp_patients_v3";

function loadPatients(): SharedPatient[] {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePatients(patients: SharedPatient[]) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(patients)); } catch {}
}

interface PatientStoreContextType {
  patients: SharedPatient[];
  addPatient: (patient: SharedPatient) => void;
  updatePatient: (id: string, updates: Partial<SharedPatient>) => void;
  updateVitals: (id: string, vitals: Vitals) => void;
  nextPatientId: () => string;
  getClinicPatients: (clinicId?: string) => SharedPatient[];
}

const PatientStoreContext = createContext<PatientStoreContextType | null>(null);

export function PatientStoreProvider({ children }: { children: React.ReactNode }) {
  const [patients, setPatients] = useState<SharedPatient[]>(() => loadPatients());

  const addPatient = useCallback((patient: SharedPatient) => {
    setPatients((prev) => {
      const next = [patient, ...prev];
      savePatients(next);
      return next;
    });
  }, []);

  const updatePatient = useCallback((id: string, updates: Partial<SharedPatient>) => {
    setPatients((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, ...updates } : p);
      savePatients(next);
      return next;
    });
  }, []);

  const updateVitals = useCallback((id: string, vitals: Vitals) => {
    setPatients((prev) => {
      const next = prev.map((p) => p.id === id ? { ...p, vitals, lastVisit: vitals.recordedAt.split(" ")[0] } : p);
      savePatients(next);
      return next;
    });
  }, []);

  const nextPatientId = useCallback(() => {
    const ids = patients.map((p) => parseInt(p.id.replace("PT-", ""), 10)).filter(Boolean);
    const max = ids.length > 0 ? Math.max(...ids) : 10000;
    return `PT-${max + 1}`;
  }, [patients]);

  // Returns only patients belonging to the given clinic.
  // SuperAdmin (no clinicId) gets all patients.
  const getClinicPatients = useCallback((clinicId?: string): SharedPatient[] => {
    if (!clinicId) return patients; // superadmin (no clinicId) sees all
    return patients.filter((p) => p.clinicId === clinicId); // strict: only exact match
  }, [patients]);

  return (
    <PatientStoreContext.Provider value={{ patients, addPatient, updatePatient, updateVitals, nextPatientId, getClinicPatients }}>
      {children}
    </PatientStoreContext.Provider>
  );
}

export function usePatientStore() {
  const ctx = useContext(PatientStoreContext);
  if (!ctx) throw new Error("usePatientStore must be used within PatientStoreProvider");
  return ctx;
}
