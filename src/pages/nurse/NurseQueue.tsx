import React, { useState } from "react";
import { Phone, Stethoscope, AlertCircle, Search, Thermometer, Heart, Wind, Weight, Activity, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCrossPortal, type PatientVitals } from "@/context/CrossPortalStore";
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

const emptyVitals = {
  temperature: "", bpSystolic: "", bpDiastolic: "", pulse: "",
  respiration: "", weight: "", height: "", o2Saturation: "", notes: "",
};

function VitalsForm({ ticketNo, patientName, nurseName, onSave }: { ticketNo: string; patientName: string; nurseName: string; onSave: (v: PatientVitals) => void }) {
  const [form, setForm] = useState(emptyVitals);
  const [errors, setErrors] = useState<string[]>([]);

  const set = (k: keyof typeof emptyVitals) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!form.temperature)   missing.push("Temperature");
    if (!form.bpSystolic || !form.bpDiastolic) missing.push("Blood Pressure");
    if (!form.pulse)         missing.push("Pulse");
    if (!form.respiration)   missing.push("Respiration");
    if (missing.length) { setErrors(missing); return; }
    setErrors([]);
    onSave({
      ...form,
      recordedAt: new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }),
      recordedBy: nurseName,
    });
  };

  return (
    <form onSubmit={handleSave} className="border-t border-orange-200 bg-orange-50/40 px-5 py-5 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-4 w-4 text-[#8B1A2F]" />
        <span className="text-sm font-semibold text-foreground">Enter Vitals — {patientName}</span>
        <span className="text-xs text-muted-foreground ml-auto">{ticketNo}</span>
      </div>

      {errors.length > 0 && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
          Required: {errors.join(", ")}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Temperature */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Thermometer className="h-3 w-3 text-orange-500" />Temperature *</Label>
          <div className="relative">
            <Input value={form.temperature} onChange={set("temperature")} placeholder="37.0" className="pr-8 bg-white" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">°C</span>
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Heart className="h-3 w-3 text-red-500" />Blood Pressure *</Label>
          <div className="flex items-center gap-1">
            <Input value={form.bpSystolic} onChange={set("bpSystolic")} placeholder="120" className="bg-white text-center" />
            <span className="text-muted-foreground text-sm font-bold">/</span>
            <Input value={form.bpDiastolic} onChange={set("bpDiastolic")} placeholder="80" className="bg-white text-center" />
          </div>
          <p className="text-[10px] text-muted-foreground">mmHg (Sys / Dia)</p>
        </div>

        {/* Pulse */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Heart className="h-3 w-3 text-[#8B1A2F]" />Pulse *</Label>
          <div className="relative">
            <Input value={form.pulse} onChange={set("pulse")} placeholder="72" className="pr-12 bg-white" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">bpm</span>
          </div>
        </div>

        {/* Respiration */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Wind className="h-3 w-3 text-blue-500" />Respiration *</Label>
          <div className="relative">
            <Input value={form.respiration} onChange={set("respiration")} placeholder="16" className="pr-14 bg-white" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">/min</span>
          </div>
        </div>

        {/* Weight */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Weight className="h-3 w-3 text-green-600" />Weight</Label>
          <div className="relative">
            <Input value={form.weight} onChange={set("weight")} placeholder="70" className="pr-8 bg-white" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">kg</span>
          </div>
        </div>

        {/* Height */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Activity className="h-3 w-3 text-purple-600" />Height</Label>
          <div className="relative">
            <Input value={form.height} onChange={set("height")} placeholder="170" className="pr-8 bg-white" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">cm</span>
          </div>
        </div>

        {/* O2 Saturation */}
        <div className="space-y-1.5">
          <Label className="text-xs flex items-center gap-1"><Wind className="h-3 w-3 text-cyan-600" />O₂ Saturation</Label>
          <div className="relative">
            <Input value={form.o2Saturation} onChange={set("o2Saturation")} placeholder="98" className="pr-6 bg-white" />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label className="text-xs">Nursing Notes</Label>
        <textarea
          value={form.notes}
          onChange={set("notes")}
          placeholder="Chief complaint, patient appearance, relevant observations..."
          rows={2}
          className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30"
        />
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="submit" className="gap-2 bg-[#8B1A2F] hover:bg-[#6e1424]">
          <CheckCircle2 className="h-4 w-4" />Save Vitals &amp; Send to Doctor
        </Button>
      </div>
    </form>
  );
}

function VitalsDisplay({ vitals }: { vitals: PatientVitals }) {
  return (
    <div className="border-t border-purple-200 bg-purple-50/30 px-5 py-4">
      <p className="text-xs font-semibold text-purple-700 mb-3 flex items-center gap-1.5">
        <CheckCircle2 className="h-3.5 w-3.5" />Vitals recorded — {vitals.recordedAt}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
        {[
          { label: "Temperature", value: vitals.temperature ? `${vitals.temperature} °C` : "—" },
          { label: "Blood Pressure", value: vitals.bpSystolic && vitals.bpDiastolic ? `${vitals.bpSystolic}/${vitals.bpDiastolic} mmHg` : "—" },
          { label: "Pulse", value: vitals.pulse ? `${vitals.pulse} bpm` : "—" },
          { label: "Respiration", value: vitals.respiration ? `${vitals.respiration} /min` : "—" },
          { label: "Weight", value: vitals.weight ? `${vitals.weight} kg` : "—" },
          { label: "Height", value: vitals.height ? `${vitals.height} cm` : "—" },
          { label: "O₂ Saturation", value: vitals.o2Saturation ? `${vitals.o2Saturation}%` : "—" },
        ].map((v) => (
          <div key={v.label}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{v.label}</p>
            <p className="font-semibold text-foreground">{v.value}</p>
          </div>
        ))}
      </div>
      {vitals.notes && (
        <p className="mt-3 text-xs text-muted-foreground border-t border-purple-100 pt-2"><span className="font-medium">Notes:</span> {vitals.notes}</p>
      )}
    </div>
  );
}

export function NurseQueue() {
  const { tickets, updateTicket } = useCrossPortal();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [expandedVitals, setExpandedVitals] = useState<Set<string>>(new Set());

  // Clinic isolation + nurse stage filter (show all clinic patients regardless of payment)
  const nurseTickets = tickets.filter((t) =>
    ["Waiting", "Called", "In Triage", "Vitals Done"].includes(t.status) &&
    (user?.role === "superadmin" || (t.clinicId === user?.clinicId))
  );

  const filtered = nurseTickets.filter((t) =>
    t.patientName.toLowerCase().includes(search.toLowerCase()) ||
    t.ticketNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveVitals = (ticketNo: string, vitals: PatientVitals) => {
    updateTicket(ticketNo, { vitals, status: "Vitals Done" });
  };

  const toggleVitals = (ticketNo: string) => {
    setExpandedVitals((prev) => {
      const next = new Set(prev);
      next.has(ticketNo) ? next.delete(ticketNo) : next.add(ticketNo);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Queue / Triage</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {nurseTickets.filter((t) => ["Waiting","Called"].includes(t.status)).length} to call ·{" "}
          {nurseTickets.filter((t) => t.status === "In Triage").length} in triage ·{" "}
          {nurseTickets.filter((t) => t.status === "Vitals Done").length} ready for doctor
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Waiting / Called", count: nurseTickets.filter((t) => ["Waiting","Called"].includes(t.status)).length, color: "text-amber-700", bg: "bg-amber-50" },
          { label: "In Triage", count: nurseTickets.filter((t) => t.status === "In Triage").length, color: "text-orange-700", bg: "bg-orange-50" },
          { label: "Vitals Done", count: nurseTickets.filter((t) => t.status === "Vitals Done").length, color: "text-purple-700", bg: "bg-purple-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border border-border bg-card p-4 shadow-sm`}>
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.bg} mb-2`}>
              <Activity className={`h-4 w-4 ${s.color}`} />
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search patient or ticket number..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Ticket list */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-muted-foreground">No patients currently in the queue.</div>
        )}

        {filtered.map((t, idx) => (
          <div key={t.ticketNo} className={`${idx !== 0 ? "border-t border-border/40" : ""} ${t.visitType === "Emergency" ? "bg-red-50/20" : ""}`}>
            {/* Ticket header row */}
            <div className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 mt-0.5 ${t.visitType === "Emergency" ? "bg-red-100" : "bg-[#fdf2f4]"}`}>
                  {t.visitType === "Emergency"
                    ? <AlertCircle className="h-5 w-5 text-red-500" />
                    : <Phone className="h-5 w-5 text-[#8B1A2F]" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#8B1A2F]">{t.ticketNo}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[t.status]}`}>{t.status}</span>
                    {t.visitType === "Emergency" && (
                      <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">EMERGENCY</span>
                    )}
                    {!t.paid && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Awaiting Payment</span>
                    )}
                  </div>
                  <p className="font-semibold text-foreground mt-1">{t.patientName}</p>
                  <p className="text-xs text-muted-foreground">
                    Age {t.age ?? "—"} · {t.gender ?? "—"} · {t.phone ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">{t.visitType} · {t.assignedDoctor}</p>
                  {t.calledAt && <p className="text-xs text-muted-foreground mt-0.5">Called at: {t.calledAt}</p>}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex-shrink-0 flex flex-col gap-2 items-end">
                {!t.paid && (
                  <span className="text-xs text-orange-600 italic">Awaiting payment at billing</span>
                )}
                {t.paid && t.status === "Waiting" && (
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" onClick={() => updateTicket(t.ticketNo, { status: "Called", calledAt: new Date().toLocaleString("en-US") })}>
                    <Phone className="h-3 w-3" />Call Patient
                  </Button>
                )}
                {t.paid && t.status === "Called" && (
                  <Button size="sm" className="text-xs h-8 gap-1.5 bg-orange-500 hover:bg-orange-600" onClick={() => { updateTicket(t.ticketNo, { status: "In Triage" }); setExpandedVitals((p) => new Set(p).add(t.ticketNo)); }}>
                    <Stethoscope className="h-3 w-3" />Start Triage
                  </Button>
                )}
                {t.paid && t.status === "In Triage" && (
                  <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-orange-300 text-orange-700" onClick={() => toggleVitals(t.ticketNo)}>
                    <Activity className="h-3 w-3" />
                    {expandedVitals.has(t.ticketNo) ? "Hide Vitals Form" : "Enter Vitals"}
                    {expandedVitals.has(t.ticketNo) ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </Button>
                )}
                {t.paid && t.status === "Vitals Done" && (
                  <div className="flex flex-col items-end gap-1.5">
                    <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5 border-[#8B1A2F] text-[#8B1A2F]" onClick={() => updateTicket(t.ticketNo, { status: "Waiting Doctor" })}>
                      <Stethoscope className="h-3 w-3" />Send to Doctor
                    </Button>
                    <button onClick={() => toggleVitals(t.ticketNo)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1">
                      {expandedVitals.has(t.ticketNo) ? <><ChevronUp className="h-3 w-3" />Hide vitals</> : <><ChevronDown className="h-3 w-3" />View vitals</>}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Inline vitals form — shown when In Triage and expanded and paid */}
            {t.paid && t.status === "In Triage" && expandedVitals.has(t.ticketNo) && (
              <VitalsForm
                ticketNo={t.ticketNo}
                patientName={t.patientName}
                nurseName={user?.name ?? "Nurse"}
                onSave={(vitals) => handleSaveVitals(t.ticketNo, vitals)}
              />
            )}

            {/* Vitals display — shown for Vitals Done when expanded */}
            {t.status === "Vitals Done" && t.vitals && expandedVitals.has(t.ticketNo) && (
              <VitalsDisplay vitals={t.vitals} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
