import React, { useState } from "react";
import { Siren, AlertTriangle, Car, Clock, TrendingUp, Users } from "lucide-react";

interface EmergencyCase {
  id: string; patientName: string; age: number; chiefComplaint: string;
  triageLevel: "Red" | "Orange" | "Yellow" | "Green"; arrivalMode: string;
  arrivalTime: string; status: "Triaged" | "In Treatment" | "Stabilised" | "Admitted" | "Discharged";
  assignedDoctor: string; location: string;
}

const CASES: EmergencyCase[] = [];

const TRIAGE_CFG = {
  Red:    { cls: "bg-red-600 text-white", light: "border-red-200 bg-red-50 text-red-700" },
  Orange: { cls: "bg-orange-500 text-white", light: "border-orange-200 bg-orange-50 text-orange-700" },
  Yellow: { cls: "bg-yellow-400 text-yellow-900", light: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  Green:  { cls: "bg-green-500 text-white", light: "border-green-200 bg-green-50 text-green-700" },
};
const STATUS_CFG: Record<EmergencyCase["status"], string> = {
  Triaged: "bg-blue-50 text-blue-700 border-blue-200",
  "In Treatment": "bg-amber-50 text-amber-700 border-amber-200",
  Stabilised: "bg-green-50 text-green-700 border-green-200",
  Admitted: "bg-purple-50 text-purple-700 border-purple-200",
  Discharged: "bg-gray-100 text-gray-600 border-gray-200",
};

export function AdminEmergency() {
  const [filter, setFilter] = useState<"All" | "Red" | "Orange" | "Yellow" | "Green">("All");
  const displayed = filter === "All" ? CASES : CASES.filter(c => c.triageLevel === filter);
  const active = CASES.filter(c => c.status !== "Discharged");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Siren className="h-6 w-6 text-red-600" />Emergency Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Real-time emergency department status and case overview</p>
      </div>

      {/* Red alert */}
      {CASES.filter(c => c.triageLevel === "Red" && c.status !== "Discharged").length > 0 && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm font-bold text-red-700">{CASES.filter(c => c.triageLevel === "Red" && c.status !== "Discharged").length} RED (Immediate) cases currently in ED</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total Active", value: active.length, cls: "text-foreground" },
          { label: "Red", value: CASES.filter(c => c.triageLevel === "Red").length, cls: "text-red-600" },
          { label: "Orange", value: CASES.filter(c => c.triageLevel === "Orange").length, cls: "text-orange-600" },
          { label: "Yellow", value: CASES.filter(c => c.triageLevel === "Yellow").length, cls: "text-yellow-600" },
          { label: "Green", value: CASES.filter(c => c.triageLevel === "Green").length, cls: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Ambulance units */}
      <div className="grid grid-cols-3 gap-4">
        <h2 className="col-span-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ambulance Fleet</h2>
        {[
          { id: "AMB-01", driver: "Driver Kojo", status: "Available", lastCall: "08:45", location: "Base Station" },
          { id: "AMB-02", driver: "Driver Ama", status: "En Route", lastCall: "10:10", location: "Accra Central → Hospital" },
          { id: "AMB-03", driver: "Driver Kweku", status: "On Scene", lastCall: "12:00", location: "Ring Road East" },
        ].map(a => (
          <div key={a.id} className={`rounded-xl border p-4 ${a.status === "On Scene" ? "border-red-300 bg-red-50" : a.status === "En Route" ? "border-amber-300 bg-amber-50" : "border-green-200 bg-green-50"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2"><Car className="h-4 w-4 text-muted-foreground" /><p className="font-bold">{a.id}</p></div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.status === "Available" ? "bg-green-600 text-white" : a.status === "En Route" ? "bg-amber-500 text-white" : "bg-red-600 text-white"}`}>{a.status}</span>
            </div>
            <p className="text-sm text-foreground">{a.driver}</p>
            <p className="text-xs text-muted-foreground">{a.location}</p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />Last dispatch: {a.lastCall}</p>
          </div>
        ))}
      </div>

      {/* Filter + Cases */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">ED Cases</h2>
          <div className="flex gap-2">
            {(["All","Red","Orange","Yellow","Green"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${filter === f ? "bg-[#8B1A2F] text-white border-[#8B1A2F]" : "border-border text-muted-foreground hover:border-[#8B1A2F]/40"}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{["ID","Patient","Complaint","Triage","Arrival","Doctor","Location","Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {displayed.map(c => (
                <tr key={c.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{c.id}</td>
                  <td className="px-4 py-3"><p className="font-medium">{c.patientName}</p><p className="text-xs text-muted-foreground">{c.age}y</p></td>
                  <td className="px-4 py-3 max-w-[180px] text-xs text-muted-foreground truncate">{c.chiefComplaint}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-0.5 rounded ${TRIAGE_CFG[c.triageLevel].cls}`}>{c.triageLevel}</span></td>
                  <td className="px-4 py-3 text-sm">{c.arrivalTime} · {c.arrivalMode}</td>
                  <td className="px-4 py-3 text-sm">{c.assignedDoctor}</td>
                  <td className="px-4 py-3 text-sm">{c.location}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_CFG[c.status]}`}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
