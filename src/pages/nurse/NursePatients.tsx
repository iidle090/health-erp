import React, { useState } from "react";
import { Search, Activity, User, Phone, Ticket, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

const statusColor: Record<string, string> = {
  Waiting:            "bg-amber-100 text-amber-700",
  Called:             "bg-blue-100 text-blue-700",
  "In Triage":        "bg-orange-100 text-orange-700",
  "Vitals Done":      "bg-purple-100 text-purple-700",
  "Waiting Doctor":   "bg-[#fdf2f4] text-[#8B1A2F]",
  "In Consultation":  "bg-[#fdf2f4] text-[#8B1A2F]",
  Completed:          "bg-green-100 text-green-700",
};

const visitTypeColor: Record<string, string> = {
  Consultation: "bg-amber-50 text-amber-700",
  "Follow-up":  "bg-blue-50 text-blue-700",
  Emergency:    "bg-red-100 text-red-700",
};

export function NursePatients() {
  const { tickets } = useCrossPortal();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [expandedVitals, setExpandedVitals] = useState<Set<string>>(new Set());

  // Clinic isolation: nurse sees all tickets from their clinic (paid or not)
  const nursePatients = tickets.filter((t) =>
    user?.role === "superadmin" || (t.clinicId === user?.clinicId)
  );

  const filtered = nursePatients.filter((t) => {
    const ms = t.patientName.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
      t.patientId.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || t.status === filter;
    return ms && mf;
  });

  const toggleVitals = (ticketNo: string) =>
    setExpandedVitals((prev) => { const n = new Set(prev); n.has(ticketNo) ? n.delete(ticketNo) : n.add(ticketNo); return n; });

  const statusFilters = ["All", "Waiting", "Called", "In Triage", "Vitals Done", "Waiting Doctor", "In Consultation", "Completed"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Patients</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {nursePatients.length} patient{nursePatients.length !== 1 ? "s" : ""} registered by reception today
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name, ticket, or patient ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {statusFilters.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center px-6">
            <User className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">No patients yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Patients registered by the receptionist (with payment collected) will appear here. Use the <strong>Queue / Triage</strong> page to call and record vitals.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map((t) => (
              <div key={t.ticketNo}>
                {/* Patient row */}
                <div className={`px-5 py-4 flex items-start gap-4 ${t.visitType === "Emergency" ? "bg-red-50/20" : ""}`}>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf2f4] text-[#8B1A2F] font-bold text-sm flex-shrink-0">
                    {t.patientName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-foreground">{t.patientName}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visitTypeColor[t.visitType]}`}>{t.visitType}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Ticket className="h-3 w-3" />{t.ticketNo}</span>
                      <span className="text-xs text-muted-foreground">{t.patientId}</span>
                      <span className="text-xs text-muted-foreground">Age {t.age ?? "—"} · {t.gender ?? "—"}</span>
                      {t.phone && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{t.phone}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.assignedDoctor} · Registered: {t.createdAt}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[t.status]}`}>{t.status}</span>
                    {t.vitals && (
                      <button onClick={() => toggleVitals(t.ticketNo)}
                        className="flex items-center gap-1 text-[10px] text-[#8B1A2F] hover:underline">
                        <Activity className="h-3 w-3" />Vitals
                        {expandedVitals.has(t.ticketNo) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded vitals */}
                {t.vitals && expandedVitals.has(t.ticketNo) && (
                  <div className="border-t border-purple-100 bg-purple-50/30 px-5 py-3">
                    <p className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide mb-2">Vitals — {t.vitals.recordedAt}</p>
                    <div className="grid grid-cols-4 gap-x-6 gap-y-1.5 text-xs">
                      {[
                        { label: "Temp", value: t.vitals.temperature ? `${t.vitals.temperature} °C` : "—" },
                        { label: "BP", value: t.vitals.bpSystolic ? `${t.vitals.bpSystolic}/${t.vitals.bpDiastolic} mmHg` : "—" },
                        { label: "Pulse", value: t.vitals.pulse ? `${t.vitals.pulse} bpm` : "—" },
                        { label: "Resp", value: t.vitals.respiration ? `${t.vitals.respiration}/min` : "—" },
                        { label: "Weight", value: t.vitals.weight ? `${t.vitals.weight} kg` : "—" },
                        { label: "Height", value: t.vitals.height ? `${t.vitals.height} cm` : "—" },
                        { label: "O₂ Sat", value: t.vitals.o2Saturation ? `${t.vitals.o2Saturation}%` : "—" },
                      ].map((v) => (
                        <div key={v.label}>
                          <span className="text-muted-foreground">{v.label}: </span>
                          <span className="font-semibold text-foreground">{v.value}</span>
                        </div>
                      ))}
                    </div>
                    {t.vitals.notes && <p className="text-xs text-muted-foreground mt-2 italic">"{t.vitals.notes}"</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
