import React, { createContext, useContext, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

// ── Types ──────────────────────────────────────────────────────────────────

export interface PatientVitals {
  temperature: string; bpSystolic: string; bpDiastolic: string; pulse: string;
  respiration: string; weight: string; height: string; o2Saturation: string;
  notes: string; recordedAt: string; recordedBy: string;
}

export interface VisitTicket {
  ticketNo: string; patientId: string; patientName: string;
  visitType: "Consultation" | "Follow-up" | "Emergency";
  assignedDoctor: string;
  status: "Waiting" | "Called" | "In Triage" | "Vitals Done" | "Waiting Doctor" | "In Consultation" | "Completed";
  consultationFee: number; paid: boolean; paymentMethod?: string;
  receiptNo?: string; createdAt: string; calledAt?: string; notes?: string;
  age?: number; gender?: string; phone?: string; vitals?: PatientVitals;
  clinicId?: string;
}

export interface LabOrder {
  id: string; patientId: string; patientName: string; orderedBy: string;
  tests: string[]; priority: "STAT" | "Urgent" | "Routine";
  status: "Pending" | "In Progress" | "Completed" | "Cancelled";
  orderDate: string; completedDate?: string; notes: string;
  results?: { test: string; value: string; unit: string; range: string; flag: "Normal" | "Abnormal" | "Critical" }[];
  sampleId?: string; sampleType?: string; collectedAt?: string;
  clinicId?: string;
}

export interface ImagingOrder {
  id: string; patientId: string; patientName: string; orderedBy: string;
  modality: "X-Ray" | "CT Scan" | "MRI" | "Ultrasound" | "Mammography" | "Fluoroscopy" | "Nuclear Medicine" | "PET Scan" | "DEXA Scan" | "Echocardiogram";
  bodyPart: string; laterality: "Left" | "Right" | "Bilateral" | "N/A";
  priority: "STAT" | "Urgent" | "Routine"; clinicalIndication: string; contrast: boolean;
  status: "Ordered" | "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  orderDate: string; scheduledDate?: string; completedDate?: string;
  findings?: string; impression?: string; notes?: string; clinicId?: string;
}

export interface PharmacyPrescription {
  id: string; patientId: string; patientName: string; prescribedBy: string;
  date: string; status: "Pending" | "Dispensed" | "Partial" | "Cancelled";
  items: { medication: string; dosage: string; qty: number; route: string; frequency: string; price: number }[];
  totalAmount: number; insurance?: string; notes?: string; clinicId?: string;
}

export interface MedicineItem {
  id: number; name: string; category: string; stock: number; unit: string;
  reorderLevel: number; expiry: string; price: number; supplier: string; barcode: string;
}

export interface Invoice {
  id: string; patientId: string; patientName: string; date: string;
  items: { description: string; qty: number; unitPrice: number; total: number }[];
  totalAmount: number; paidAmount: number; status: "Unpaid" | "Paid" | "Partial" | "Insurance";
  insurance?: string; dueDate: string;
}

export type ExpenseCategory = "Medicine Purchase" | "Lab Equipment" | "Medical Supplies" | "Assets & Machinery" | "Staff Salaries" | "Utilities" | "Maintenance" | "Other";

export interface Expense {
  id: string; clinicId: string; date: string; category: ExpenseCategory;
  description: string; amount: number; currency: "USD";
  supplier?: string; paidBy: string;
  paymentMethod: "Cash" | "Bank Transfer" | "Cheque" | "Card";
  status: "Paid" | "Pending" | "Cancelled"; notes?: string;
  linkedPurchaseRequestId?: string; createdAt: string;
}

export interface PurchaseRequest {
  id: string; clinicId: string; itemName: string; category: ExpenseCategory;
  quantity: number; unit: string; estimatedCost: number; currency: "USD";
  supplier?: string; requestedBy: string; requestedAt: string;
  status: "Pending" | "Approved" | "Rejected" | "Paid";
  approvedBy?: string; approvedAt?: string; notes?: string; inventoryItemId?: number;
}

// ── Static inventory (not yet moved to DB) ────────────────────────────────

const STATIC_INVENTORY: MedicineItem[] = [
  { id: 1, name: "Metformin 1000mg", category: "Antidiabetic", stock: 120, unit: "tabs", reorderLevel: 50, expiry: "2026-12-31", price: 0.35, supplier: "MedPharma Inc.", barcode: "MFM1000" },
  { id: 2, name: "Lisinopril 10mg", category: "Cardiovascular", stock: 85, unit: "tabs", reorderLevel: 40, expiry: "2026-09-30", price: 0.50, supplier: "CardioMed", barcode: "LSN010" },
  { id: 3, name: "Aspirin 81mg", category: "Antiplatelet", stock: 200, unit: "tabs", reorderLevel: 80, expiry: "2027-03-31", price: 0.20, supplier: "GenericPharm", barcode: "ASP081" },
  { id: 4, name: "Atorvastatin 20mg", category: "Statin", stock: 60, unit: "tabs", reorderLevel: 30, expiry: "2026-06-30", price: 0.80, supplier: "LipidCare", barcode: "ATR020" },
  { id: 5, name: "Furosemide 40mg", category: "Diuretic", stock: 18, unit: "vials", reorderLevel: 25, expiry: "2025-08-31", price: 1.20, supplier: "AquaMed", barcode: "FUR040" },
  { id: 6, name: "Carvedilol 6.25mg", category: "Beta Blocker", stock: 45, unit: "tabs", reorderLevel: 20, expiry: "2026-11-30", price: 0.65, supplier: "CardioMed", barcode: "CVD625" },
  { id: 7, name: "Spironolactone 25mg", category: "Diuretic", stock: 30, unit: "tabs", reorderLevel: 15, expiry: "2026-04-30", price: 0.45, supplier: "MedPharma Inc.", barcode: "SPN025" },
  { id: 8, name: "Methotrexate 15mg", category: "DMARD", stock: 8, unit: "tabs", reorderLevel: 10, expiry: "2025-06-30", price: 3.50, supplier: "RheumaCare", barcode: "MTX015" },
  { id: 9, name: "Sertraline 50mg", category: "Antidepressant", stock: 75, unit: "tabs", reorderLevel: 30, expiry: "2026-10-31", price: 0.60, supplier: "MindMed", barcode: "SRT050" },
  { id: 10, name: "Sumatriptan 50mg", category: "Antimigraine", stock: 24, unit: "tabs", reorderLevel: 12, expiry: "2025-05-31", price: 8.50, supplier: "NeuroPharma", barcode: "SMT050" },
  { id: 11, name: "Topiramate 50mg", category: "Anticonvulsant", stock: 40, unit: "tabs", reorderLevel: 20, expiry: "2026-07-31", price: 0.90, supplier: "NeuroPharma", barcode: "TPM050" },
  { id: 12, name: "Tiotropium 18mcg", category: "Bronchodilator", stock: 5, unit: "inhalers", reorderLevel: 8, expiry: "2025-07-31", price: 28.00, supplier: "RespiCare", barcode: "TTP018" },
  { id: 13, name: "Fluticasone 250mcg", category: "Inhaled Corticosteroid", stock: 15, unit: "inhalers", reorderLevel: 10, expiry: "2026-01-31", price: 22.00, supplier: "RespiCare", barcode: "FLT250" },
  { id: 14, name: "Albuterol 90mcg", category: "Bronchodilator", stock: 30, unit: "inhalers", reorderLevel: 15, expiry: "2026-03-31", price: 18.00, supplier: "RespiCare", barcode: "ALB090" },
  { id: 15, name: "Folic Acid 1mg", category: "Vitamin", stock: 180, unit: "tabs", reorderLevel: 60, expiry: "2027-12-31", price: 0.10, supplier: "VitaSupply", barcode: "FOL001" },
];

// ── API helpers ─────────────────────────────────────────────────────────────

function qs(clinicId?: string | null): string {
  return clinicId ? `?clinicId=${encodeURIComponent(clinicId)}` : "";
}

async function apiFetch<T>(url: string): Promise<T[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function apiPut<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Context type (same interface as before) ─────────────────────────────────

interface CrossPortalContextType {
  imagingOrders: ImagingOrder[]; addImagingOrder: (o: ImagingOrder) => void; updateImagingOrder: (id: string, u: Partial<ImagingOrder>) => void;
  labOrders: LabOrder[]; addLabOrder: (o: LabOrder) => void; updateLabOrder: (id: string, u: Partial<LabOrder>) => void;
  prescriptions: PharmacyPrescription[]; addPrescription: (p: PharmacyPrescription) => void; updatePrescription: (id: string, u: Partial<PharmacyPrescription>) => void;
  inventory: MedicineItem[]; updateInventory: (id: number, u: Partial<MedicineItem>) => void; addInventoryItem: (m: MedicineItem) => void;
  invoices: Invoice[]; addInvoice: (inv: Invoice) => void; updateInvoice: (id: string, u: Partial<Invoice>) => void;
  tickets: VisitTicket[]; addTicket: (t: VisitTicket) => void; updateTicket: (ticketNo: string, u: Partial<VisitTicket>) => void;
  expenses: Expense[]; addExpense: (e: Expense) => void; updateExpense: (id: string, u: Partial<Expense>) => void;
  purchaseRequests: PurchaseRequest[]; addPurchaseRequest: (r: PurchaseRequest) => void; updatePurchaseRequest: (id: string, u: Partial<PurchaseRequest>) => void;
}

const CrossPortalContext = createContext<CrossPortalContextType | null>(null);

// ── Provider ────────────────────────────────────────────────────────────────

export function CrossPortalProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const clinicId = user?.clinicId ?? null;
  const isSuperAdmin = user?.role === "superadmin";

  // Query key includes clinicId so each clinic fetches its own data
  const ticketKey = ["visit-tickets", clinicId];
  const labKey = ["lab-orders", clinicId];
  const imagingKey = ["imaging-orders", clinicId];
  const rxKey = ["prescriptions", clinicId];
  const expKey = ["expenses", clinicId];
  const prKey = ["purchase-requests", clinicId];

  // Refetch every 5s so nurse/doctor dashboards see live updates across sessions
  const LIVE = { refetchInterval: 5000, staleTime: 0 };

  const { data: tickets = [] } = useQuery<VisitTicket[]>({
    queryKey: ticketKey,
    queryFn: () => apiFetch<VisitTicket>(isSuperAdmin ? "/api/visit-tickets" : `/api/visit-tickets${qs(clinicId)}`),
    enabled: !!user,
    ...LIVE,
  });

  const { data: labOrders = [] } = useQuery<LabOrder[]>({
    queryKey: labKey,
    queryFn: () => apiFetch<LabOrder>(isSuperAdmin ? "/api/lab-orders" : `/api/lab-orders${qs(clinicId)}`),
    enabled: !!user,
    refetchInterval: 8000, staleTime: 0,
  });

  const { data: imagingOrders = [] } = useQuery<ImagingOrder[]>({
    queryKey: imagingKey,
    queryFn: () => apiFetch<ImagingOrder>(isSuperAdmin ? "/api/imaging-orders" : `/api/imaging-orders${qs(clinicId)}`),
    enabled: !!user,
    refetchInterval: 8000, staleTime: 0,
  });

  const { data: prescriptions = [] } = useQuery<PharmacyPrescription[]>({
    queryKey: rxKey,
    queryFn: () => apiFetch<PharmacyPrescription>(isSuperAdmin ? "/api/prescriptions" : `/api/prescriptions${qs(clinicId)}`),
    enabled: !!user,
    refetchInterval: 8000, staleTime: 0,
  });

  const { data: expenses = [] } = useQuery<Expense[]>({
    queryKey: expKey,
    queryFn: () => apiFetch<Expense>(isSuperAdmin ? "/api/expenses" : `/api/expenses${qs(clinicId)}`),
    enabled: !!user,
    refetchInterval: 15000, staleTime: 0,
  });

  const { data: purchaseRequests = [] } = useQuery<PurchaseRequest[]>({
    queryKey: prKey,
    queryFn: () => apiFetch<PurchaseRequest>(isSuperAdmin ? "/api/purchase-requests" : `/api/purchase-requests${qs(clinicId)}`),
    enabled: !!user,
    refetchInterval: 15000, staleTime: 0,
  });

  // Static inventory (not in DB yet — keep in memory)
  const [inventory, setInventory] = React.useState<MedicineItem[]>(STATIC_INVENTORY);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);

  // ── Tickets ──────────────────────────────────────────────────────────────

  const addTicketMut = useMutation({
    mutationFn: (t: VisitTicket) => apiPost<VisitTicket>("/api/visit-tickets", t),
    onSuccess: () => qc.invalidateQueries({ queryKey: ticketKey }),
  });

  const updateTicketMut = useMutation({
    mutationFn: ({ ticketNo, u }: { ticketNo: string; u: Partial<VisitTicket> }) =>
      apiPut<VisitTicket>(`/api/visit-tickets/${encodeURIComponent(ticketNo)}`, u),
    onMutate: async ({ ticketNo, u }) => {
      // Optimistic update for instant UI response
      await qc.cancelQueries({ queryKey: ticketKey });
      const prev = qc.getQueryData<VisitTicket[]>(ticketKey) ?? [];
      qc.setQueryData<VisitTicket[]>(ticketKey, prev.map(t => t.ticketNo === ticketNo ? { ...t, ...u } : t));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(ticketKey, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: ticketKey }),
  });

  const addTicket = useCallback((t: VisitTicket) => { addTicketMut.mutate(t); }, [addTicketMut]);
  const updateTicket = useCallback((ticketNo: string, u: Partial<VisitTicket>) => { updateTicketMut.mutate({ ticketNo, u }); }, [updateTicketMut]);

  // ── Lab Orders ───────────────────────────────────────────────────────────

  const addLabMut = useMutation({
    mutationFn: (o: LabOrder) => apiPost<LabOrder>("/api/lab-orders", o),
    onSuccess: () => qc.invalidateQueries({ queryKey: labKey }),
  });

  const updateLabMut = useMutation({
    mutationFn: ({ id, u }: { id: string; u: Partial<LabOrder> }) =>
      apiPut<LabOrder>(`/api/lab-orders/${id}`, u),
    onMutate: async ({ id, u }) => {
      await qc.cancelQueries({ queryKey: labKey });
      const prev = qc.getQueryData<LabOrder[]>(labKey) ?? [];
      qc.setQueryData<LabOrder[]>(labKey, prev.map(o => o.id === id ? { ...o, ...u } : o));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(labKey, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: labKey }),
  });

  const addLabOrder = useCallback((o: LabOrder) => { addLabMut.mutate(o); }, [addLabMut]);
  const updateLabOrder = useCallback((id: string, u: Partial<LabOrder>) => { updateLabMut.mutate({ id, u }); }, [updateLabMut]);

  // ── Imaging Orders ───────────────────────────────────────────────────────

  const addImagingMut = useMutation({
    mutationFn: (o: ImagingOrder) => apiPost<ImagingOrder>("/api/imaging-orders", o),
    onSuccess: () => qc.invalidateQueries({ queryKey: imagingKey }),
  });

  const updateImagingMut = useMutation({
    mutationFn: ({ id, u }: { id: string; u: Partial<ImagingOrder> }) =>
      apiPut<ImagingOrder>(`/api/imaging-orders/${id}`, u),
    onMutate: async ({ id, u }) => {
      await qc.cancelQueries({ queryKey: imagingKey });
      const prev = qc.getQueryData<ImagingOrder[]>(imagingKey) ?? [];
      qc.setQueryData<ImagingOrder[]>(imagingKey, prev.map(o => o.id === id ? { ...o, ...u } : o));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(imagingKey, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: imagingKey }),
  });

  const addImagingOrder = useCallback((o: ImagingOrder) => { addImagingMut.mutate(o); }, [addImagingMut]);
  const updateImagingOrder = useCallback((id: string, u: Partial<ImagingOrder>) => { updateImagingMut.mutate({ id, u }); }, [updateImagingMut]);

  // ── Prescriptions ────────────────────────────────────────────────────────

  const addRxMut = useMutation({
    mutationFn: (p: PharmacyPrescription) => apiPost<PharmacyPrescription>("/api/prescriptions", p),
    onSuccess: () => qc.invalidateQueries({ queryKey: rxKey }),
  });

  const updateRxMut = useMutation({
    mutationFn: ({ id, u }: { id: string; u: Partial<PharmacyPrescription> }) =>
      apiPut<PharmacyPrescription>(`/api/prescriptions/${id}`, u),
    onMutate: async ({ id, u }) => {
      await qc.cancelQueries({ queryKey: rxKey });
      const prev = qc.getQueryData<PharmacyPrescription[]>(rxKey) ?? [];
      qc.setQueryData<PharmacyPrescription[]>(rxKey, prev.map(p => p.id === id ? { ...p, ...u } : p));
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(rxKey, ctx.prev); },
    onSettled: () => qc.invalidateQueries({ queryKey: rxKey }),
  });

  const addPrescription = useCallback((p: PharmacyPrescription) => { addRxMut.mutate(p); }, [addRxMut]);
  const updatePrescription = useCallback((id: string, u: Partial<PharmacyPrescription>) => { updateRxMut.mutate({ id, u }); }, [updateRxMut]);

  // ── Expenses ─────────────────────────────────────────────────────────────

  const addExpMut = useMutation({
    mutationFn: (e: Expense) => apiPost<Expense>("/api/expenses", e),
    onSuccess: () => qc.invalidateQueries({ queryKey: expKey }),
  });

  const updateExpMut = useMutation({
    mutationFn: ({ id, u }: { id: string; u: Partial<Expense> }) =>
      apiPut<Expense>(`/api/expenses/${id}`, u),
    onSuccess: () => qc.invalidateQueries({ queryKey: expKey }),
  });

  const addExpense = useCallback((e: Expense) => { addExpMut.mutate(e); }, [addExpMut]);
  const updateExpense = useCallback((id: string, u: Partial<Expense>) => { updateExpMut.mutate({ id, u }); }, [updateExpMut]);

  // ── Purchase Requests ────────────────────────────────────────────────────

  const addPrMut = useMutation({
    mutationFn: (r: PurchaseRequest) => apiPost<PurchaseRequest>("/api/purchase-requests", r),
    onSuccess: () => qc.invalidateQueries({ queryKey: prKey }),
  });

  const updatePrMut = useMutation({
    mutationFn: ({ id, u }: { id: string; u: Partial<PurchaseRequest> }) =>
      apiPut<PurchaseRequest>(`/api/purchase-requests/${id}`, u),
    onSuccess: () => qc.invalidateQueries({ queryKey: prKey }),
  });

  const addPurchaseRequest = useCallback((r: PurchaseRequest) => { addPrMut.mutate(r); }, [addPrMut]);
  const updatePurchaseRequest = useCallback((id: string, u: Partial<PurchaseRequest>) => { updatePrMut.mutate({ id, u }); }, [updatePrMut]);

  // ── Static inventory helpers ─────────────────────────────────────────────

  const addInventoryItem = useCallback((m: MedicineItem) => setInventory(p => [m, ...p]), []);
  const updateInventory = useCallback((id: number, u: Partial<MedicineItem>) =>
    setInventory(p => p.map(m => m.id === id ? { ...m, ...u } : m)), []);

  // ── Static invoices helpers (kept in memory, used for billing receipts) ──

  const addInvoice = useCallback((inv: Invoice) => setInvoices(p => [inv, ...p]), []);
  const updateInvoice = useCallback((id: string, u: Partial<Invoice>) =>
    setInvoices(p => p.map(inv => inv.id === id ? { ...inv, ...u } : inv)), []);

  return (
    <CrossPortalContext.Provider value={{
      imagingOrders, addImagingOrder, updateImagingOrder,
      labOrders, addLabOrder, updateLabOrder,
      prescriptions, addPrescription, updatePrescription,
      inventory, addInventoryItem, updateInventory,
      invoices, addInvoice, updateInvoice,
      tickets, addTicket, updateTicket,
      expenses, addExpense, updateExpense,
      purchaseRequests, addPurchaseRequest, updatePurchaseRequest,
    }}>
      {children}
    </CrossPortalContext.Provider>
  );
}

export function useCrossPortal() {
  const ctx = useContext(CrossPortalContext);
  if (!ctx) throw new Error("useCrossPortal must be within CrossPortalProvider");
  return ctx;
}
