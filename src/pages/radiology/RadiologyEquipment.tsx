import React, { useState } from "react";
import { Cpu, CheckCircle, AlertTriangle, XCircle, Clock, Wrench, Activity, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

type EquipStatus = "Available" | "In Use" | "Maintenance" | "Offline";

interface Equipment {
  id: string;
  name: string;
  modality: string;
  model: string;
  room: string;
  status: EquipStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  hoursToday: number;
  totalStudies: number;
  notes?: string;
}

const DEFAULT_EQUIPMENT: Equipment[] = [
  { id: "EQ-001", name: "X-Ray Room 1", modality: "X-Ray", model: "Siemens YSIO Max", room: "Room 101", status: "Available", lastMaintenance: "2026-03-15", nextMaintenance: "2026-06-15", hoursToday: 3.5, totalStudies: 1240 },
  { id: "EQ-002", name: "X-Ray Room 2", modality: "X-Ray", model: "GE Revolution XR/d", room: "Room 102", status: "In Use", lastMaintenance: "2026-03-01", nextMaintenance: "2026-06-01", hoursToday: 5.0, totalStudies: 890 },
  { id: "EQ-003", name: "CT Scanner 1", modality: "CT Scan", model: "Siemens SOMATOM Edge Plus", room: "Room 201", status: "Available", lastMaintenance: "2026-04-01", nextMaintenance: "2026-07-01", hoursToday: 4.0, totalStudies: 520, notes: "Cardiac CT protocol updated 04/01" },
  { id: "EQ-004", name: "CT Scanner 2", modality: "CT Scan", model: "Philips Incisive CT", room: "Room 202", status: "Maintenance", lastMaintenance: "2026-04-08", nextMaintenance: "2026-04-15", hoursToday: 0, totalStudies: 310, notes: "Scheduled annual calibration" },
  { id: "EQ-005", name: "MRI 1.5T", modality: "MRI", model: "GE Signa Creator 1.5T", room: "Room 301", status: "In Use", lastMaintenance: "2026-03-20", nextMaintenance: "2026-06-20", hoursToday: 6.5, totalStudies: 740 },
  { id: "EQ-006", name: "MRI 3.0T", modality: "MRI", model: "Siemens MAGNETOM Vida 3T", room: "Room 302", status: "Available", lastMaintenance: "2026-04-05", nextMaintenance: "2026-07-05", hoursToday: 2.0, totalStudies: 390 },
  { id: "EQ-007", name: "Ultrasound 1", modality: "Ultrasound", model: "Philips EPIQ Elite", room: "Room 401", status: "Available", lastMaintenance: "2026-03-28", nextMaintenance: "2026-06-28", hoursToday: 4.5, totalStudies: 1580 },
  { id: "EQ-008", name: "Ultrasound 2", modality: "Ultrasound", model: "GE Voluson E10", room: "Room 402", status: "In Use", lastMaintenance: "2026-03-15", nextMaintenance: "2026-06-15", hoursToday: 5.5, totalStudies: 1210 },
  { id: "EQ-009", name: "Mammography Unit", modality: "Mammography", model: "Hologic Selenia Dimensions", room: "Room 501", status: "Available", lastMaintenance: "2026-04-02", nextMaintenance: "2026-07-02", hoursToday: 3.0, totalStudies: 420 },
  { id: "EQ-010", name: "Fluoroscopy Suite", modality: "Fluoroscopy", model: "Siemens LUMINOS Agile", room: "Room 601", status: "Offline", lastMaintenance: "2026-03-10", nextMaintenance: "2026-04-20", hoursToday: 0, totalStudies: 180, notes: "Power supply fault — biomedical engineering contacted" },
  { id: "EQ-011", name: "Nuclear Medicine SPECT", modality: "Nuclear Medicine", model: "GE Discovery NM630", room: "Room 701", status: "Available", lastMaintenance: "2026-03-25", nextMaintenance: "2026-06-25", hoursToday: 2.5, totalStudies: 156 },
  { id: "EQ-012", name: "PET-CT Scanner", modality: "PET Scan", model: "Siemens Biograph mCT", room: "Room 801", status: "Available", lastMaintenance: "2026-04-01", nextMaintenance: "2026-07-01", hoursToday: 3.0, totalStudies: 98 },
  { id: "EQ-013", name: "DEXA Scanner", modality: "DEXA Scan", model: "Hologic Discovery W", room: "Room 901", status: "In Use", lastMaintenance: "2026-03-18", nextMaintenance: "2026-06-18", hoursToday: 2.0, totalStudies: 340 },
  { id: "EQ-014", name: "Echo Lab", modality: "Echocardiogram", model: "Philips EPIQ CVx", room: "Room 1001", status: "Available", lastMaintenance: "2026-04-03", nextMaintenance: "2026-07-03", hoursToday: 3.5, totalStudies: 280 },
];

const STATUS_CONFIG: Record<EquipStatus, { color: string; icon: React.ElementType; badge: string }> = {
  Available:   { color: "border-green-400", icon: CheckCircle, badge: "bg-green-50 text-green-700 border-green-200" },
  "In Use":    { color: "border-blue-400",  icon: Activity,    badge: "bg-blue-50 text-blue-700 border-blue-200" },
  Maintenance: { color: "border-amber-400", icon: Wrench,      badge: "bg-amber-50 text-amber-700 border-amber-200" },
  Offline:     { color: "border-red-400",   icon: XCircle,     badge: "bg-red-50 text-red-700 border-red-200" },
};

export function RadiologyEquipment() {
  const { imagingOrders } = useCrossPortal();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<Equipment[]>(DEFAULT_EQUIPMENT);

  // Clinic isolation: only count studies from this clinic
  const clinicOrders = imagingOrders.filter((o) =>
    user?.role === "superadmin" || (o.clinicId === user?.clinicId)
  );
  const [modalityFilter, setModalityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<EquipStatus | "All">("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<EquipStatus>("Available");
  const [editNotes, setEditNotes] = useState("");

  const modalities = ["All", ...Array.from(new Set(equipment.map((e) => e.modality)))];
  const statusOptions: EquipStatus[] = ["Available", "In Use", "Maintenance", "Offline"];

  const filtered = equipment.filter((e) => {
    const mm = modalityFilter === "All" || e.modality === modalityFilter;
    const ms = statusFilter === "All" || e.status === statusFilter;
    return mm && ms;
  });

  const summary = {
    available: equipment.filter((e) => e.status === "Available").length,
    inUse: equipment.filter((e) => e.status === "In Use").length,
    maintenance: equipment.filter((e) => e.status === "Maintenance").length,
    offline: equipment.filter((e) => e.status === "Offline").length,
  };

  const getStudiesForModality = (modality: string) => clinicOrders.filter((o) => o.modality === modality && o.status !== "Cancelled").length;

  const startEdit = (e: Equipment) => { setEditingId(e.id); setEditStatus(e.status); setEditNotes(e.notes ?? ""); };
  const saveEdit = (id: string) => {
    setEquipment((prev) => prev.map((e) => e.id === id ? { ...e, status: editStatus, notes: editNotes || undefined } : e));
    setEditingId(null);
  };

  const isMaintenanceDue = (dateStr: string) => {
    const due = new Date(dateStr);
    const now = new Date();
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 14;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Equipment Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{equipment.length} imaging systems across {new Set(equipment.map((e) => e.room)).size} rooms</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Available", count: summary.available, icon: CheckCircle, cls: "bg-green-50 text-green-700", iconBg: "bg-green-100", filter: "Available" as EquipStatus },
          { label: "In Use", count: summary.inUse, icon: Activity, cls: "bg-blue-50 text-blue-700", iconBg: "bg-blue-100", filter: "In Use" as EquipStatus },
          { label: "Maintenance", count: summary.maintenance, icon: Wrench, cls: "bg-amber-50 text-amber-700", iconBg: "bg-amber-100", filter: "Maintenance" as EquipStatus },
          { label: "Offline", count: summary.offline, icon: XCircle, cls: "bg-red-50 text-red-700", iconBg: "bg-red-100", filter: "Offline" as EquipStatus },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStatusFilter(statusFilter === s.filter ? "All" : s.filter)}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.iconBg}`}>
                <s.icon className={`h-4 w-4 ${s.cls.split(" ")[1]}`} />
              </div>
            </div>
            <p className={`text-3xl font-bold ${s.cls.split(" ")[1]}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <select value={modalityFilter} onChange={(e) => setModalityFilter(e.target.value)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
          {modalities.map((m) => <option key={m}>{m}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
          <option value="All">All Status</option>
          {statusOptions.map((s) => <option key={s}>{s}</option>)}
        </select>
        {(modalityFilter !== "All" || statusFilter !== "All") && (
          <button onClick={() => { setModalityFilter("All"); setStatusFilter("All"); }}
            className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground">Clear filters</button>
        )}
      </div>

      {/* Equipment grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((e) => {
          const cfg = STATUS_CONFIG[e.status];
          const StatusIcon = cfg.icon;
          const maintDue = isMaintenanceDue(e.nextMaintenance);
          const isEditing = editingId === e.id;

          return (
            <div key={e.id} className={`rounded-xl border-2 bg-card shadow-sm p-4 transition-all ${cfg.color}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-[10px] font-bold text-muted-foreground">{e.id}</span>
                    <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">{e.name}</h3>
                  <p className="text-xs text-muted-foreground">{e.model}</p>
                  <p className="text-[10px] text-muted-foreground">{e.room}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${cfg.badge}`}>
                    <StatusIcon className="h-3 w-3" />{e.status}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{e.modality}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-base font-bold text-foreground">{e.hoursToday}h</p>
                  <p className="text-[10px] text-muted-foreground">Today</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-foreground">{getStudiesForModality(e.modality)}</p>
                  <p className="text-[10px] text-muted-foreground">ERP Orders</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-foreground">{e.totalStudies}</p>
                  <p className="text-[10px] text-muted-foreground">All-time</p>
                </div>
              </div>

              {/* Maintenance */}
              <div className={`rounded-lg p-2 mb-3 ${maintDue ? "bg-amber-50 border border-amber-100" : "bg-muted/30"}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Calendar className={`h-3 w-3 ${maintDue ? "text-amber-600" : "text-muted-foreground"}`} />
                  <p className={`text-[10px] font-semibold ${maintDue ? "text-amber-700" : "text-muted-foreground"}`}>
                    {maintDue ? "Maintenance Due Soon" : "Maintenance"}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground">Last: {e.lastMaintenance}</p>
                <p className={`text-[10px] font-medium ${maintDue ? "text-amber-700" : "text-muted-foreground"}`}>Next: {e.nextMaintenance}</p>
              </div>

              {e.notes && !isEditing && (
                <div className="rounded-lg bg-muted/20 px-2.5 py-1.5 mb-3">
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{e.notes}</p>
                </div>
              )}

              {isEditing ? (
                <div className="space-y-2">
                  <select value={editStatus} onChange={(ev) => setEditStatus(ev.target.value as EquipStatus)}
                    className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs">
                    {statusOptions.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <textarea value={editNotes} onChange={(ev) => setEditNotes(ev.target.value)}
                    placeholder="Status notes..." rows={2}
                    className="w-full rounded-lg border border-input bg-background px-2 py-1.5 text-xs resize-none focus:outline-none" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => setEditingId(null)}>Cancel</Button>
                    <Button size="sm" className="flex-1 h-7 text-xs bg-[#0f2d4a] text-white" onClick={() => saveEdit(e.id)}>Save</Button>
                  </div>
                </div>
              ) : (
                <Button variant="outline" size="sm" className="w-full h-7 text-xs gap-1 mt-auto" onClick={() => startEdit(e)}>
                  <Wrench className="h-3 w-3" />Update Status
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
