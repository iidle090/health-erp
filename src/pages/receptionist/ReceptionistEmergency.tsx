import React, { useState } from "react";
import { Siren, Plus, Phone, X, Clock, AlertTriangle, Car, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EmergencyCase {
  id: string; patientName: string; age: number; gender: string; contact: string;
  chiefComplaint: string; triageLevel: "Red" | "Orange" | "Yellow" | "Green";
  arrivalMode: "Walk-in" | "Ambulance" | "Police" | "Referral";
  arrivalTime: string; status: "Triaged" | "In Treatment" | "Stabilised" | "Admitted" | "Discharged";
  assignedDoctor: string; location: string; notes: string;
  ambulanceDispatched?: boolean; ambulanceId?: string;
}

const EMRG_KEY = "health_erp_emergency_v3";
function load(): EmergencyCase[] { try { const s = localStorage.getItem(EMRG_KEY); return s ? JSON.parse(s) : []; } catch { return []; } }
function save(d: EmergencyCase[]) { try { localStorage.setItem(EMRG_KEY, JSON.stringify(d)); } catch {} }

const INITIAL: EmergencyCase[] = [];

const TRIAGE_CFG = {
  Red:    { cls: "bg-red-600 text-white border-red-700", light: "bg-red-50 border-red-200 text-red-700", label: "Immediate" },
  Orange: { cls: "bg-orange-500 text-white border-orange-600", light: "bg-orange-50 border-orange-200 text-orange-700", label: "Urgent" },
  Yellow: { cls: "bg-yellow-400 text-yellow-900 border-yellow-500", light: "bg-yellow-50 border-yellow-200 text-yellow-700", label: "Delayed" },
  Green:  { cls: "bg-green-500 text-white border-green-600", light: "bg-green-50 border-green-200 text-green-700", label: "Minor" },
};
const STATUS_CFG: Record<EmergencyCase["status"], string> = {
  Triaged: "bg-blue-50 text-blue-700 border-blue-200",
  "In Treatment": "bg-amber-50 text-amber-700 border-amber-200",
  Stabilised: "bg-green-50 text-green-700 border-green-200",
  Admitted: "bg-purple-50 text-purple-700 border-purple-200",
  Discharged: "bg-gray-100 text-gray-600 border-gray-200",
};

export function ReceptionistEmergency() {
  const { toast } = useToast();
  const [cases, setCases] = useState<EmergencyCase[]>(load);
  const [showNew, setShowNew] = useState(false);
  const [showAmbulance, setShowAmbulance] = useState(false);
  const [ambDest, setAmbDest] = useState("");
  const [ambContact, setAmbContact] = useState("");

  const save_ = (d: EmergencyCase[]) => { save(d); setCases(d); };

  const dispatchAmbulance = () => {
    toast({ title: "Ambulance dispatched!", description: `Unit AMB-01 en route to ${ambDest}. Contact: ${ambContact}` });
    setShowAmbulance(false); setAmbDest(""); setAmbContact("");
  };

  const active = cases.filter(c => !["Discharged"].includes(c.status));
  const red = cases.filter(c => c.triageLevel === "Red" && !["Discharged"].includes(c.status)).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Siren className="h-6 w-6 text-red-600" />Emergency & Ambulance</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Emergency triage, registration, and ambulance dispatch</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAmbulance(true)} variant="outline" className="gap-2 border-red-300 text-red-600 hover:bg-red-50"><Car className="h-4 w-4" />Dispatch Ambulance</Button>
          <Button onClick={() => setShowNew(true)} className="bg-red-600 hover:bg-red-700 text-white gap-2"><Plus className="h-4 w-4" />Register Emergency</Button>
        </div>
      </div>

      {red > 0 && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0" />
          <p className="text-sm font-bold text-red-700">{red} RED (Immediate) case{red > 1 ? "s" : ""} require immediate attention!</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Cases", value: active.length, cls: "text-foreground" },
          { label: "Red / Immediate", value: cases.filter(c => c.triageLevel === "Red").length, cls: "text-red-600" },
          { label: "In Treatment", value: cases.filter(c => c.status === "In Treatment").length, cls: "text-amber-600" },
          { label: "Discharged Today", value: cases.filter(c => c.status === "Discharged").length, cls: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Cases */}
      <div className="space-y-3">
        {cases.map(c => {
          const tri = TRIAGE_CFG[c.triageLevel];
          return (
            <div key={c.id} className={`rounded-xl border bg-card p-4 ${c.triageLevel === "Red" && c.status !== "Discharged" ? "border-red-300 shadow-sm" : "border-border"}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold border ${tri.cls}`}>
                    {c.triageLevel}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{c.patientName} <span className="text-muted-foreground font-normal text-sm">· {c.age}y {c.gender}</span></p>
                    <p className="text-xs text-muted-foreground">{c.id} · {c.arrivalMode} · {c.arrivalTime}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_CFG[c.status]}`}>{c.status}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs mb-3">
                <div><span className="text-muted-foreground">Complaint: </span><span className="font-medium">{c.chiefComplaint}</span></div>
                <div><span className="text-muted-foreground">Doctor: </span><span className="font-medium">{c.assignedDoctor}</span></div>
                <div><span className="text-muted-foreground">Location: </span><span className="font-medium">{c.location}</span></div>
              </div>
              {c.notes && <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 mb-3">{c.notes}</p>}
              <div className="flex items-center gap-2">
                {c.status !== "Discharged" && (
                  <select value={c.status} onChange={e => { const u = cases.map(x => x.id === c.id ? { ...x, status: e.target.value as EmergencyCase["status"] } : x); save_(u); }}
                    className="text-xs rounded-lg border border-border px-2 py-1.5 bg-background focus:outline-none">
                    {["Triaged","In Treatment","Stabilised","Admitted","Discharged"].map(s => <option key={s}>{s}</option>)}
                  </select>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto"><Phone className="h-3 w-3" />{c.contact}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Register Emergency Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-red-600 flex items-center gap-2"><Siren className="h-5 w-5" />Register Emergency Case</h2>
              <button onClick={() => setShowNew(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <EmergencyForm onSubmit={data => {
              const newCase: EmergencyCase = { ...data, id: `EM-${String(cases.length + 1).padStart(3, "0")}`, arrivalTime: new Date().toLocaleString(), status: "Triaged" };
              const u = [newCase, ...cases]; save_(u);
              setShowNew(false); toast({ title: "Emergency registered!", description: `${data.patientName} — Triage: ${data.triageLevel}` });
            }} onCancel={() => setShowNew(false)} />
          </div>
        </div>
      )}

      {/* Ambulance Dispatch */}
      {showAmbulance && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowAmbulance(false)}>
          <div className="bg-card rounded-2xl border border-red-200 p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-red-600 flex items-center gap-2"><Car className="h-5 w-5" />Dispatch Ambulance</h2>
              <button onClick={() => setShowAmbulance(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-xs font-medium">Pickup Address / Location</label><input className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none" value={ambDest} onChange={e => setAmbDest(e.target.value)} placeholder="e.g. Accra Central Market" /></div>
              <div><label className="text-xs font-medium">Contact / Caller Number</label><input className="w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none" value={ambContact} onChange={e => setAmbContact(e.target.value)} placeholder="+233-…" /></div>
              <Button onClick={dispatchAmbulance} className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"><Car className="h-4 w-4" />Dispatch Now</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmergencyForm({ onSubmit, onCancel }: { onSubmit: (d: Omit<EmergencyCase, "id" | "arrivalTime" | "status">) => void; onCancel: () => void }) {
  const [f, setF] = useState({ patientName: "", age: "", gender: "Male", contact: "", chiefComplaint: "", triageLevel: "Orange" as EmergencyCase["triageLevel"], arrivalMode: "Walk-in" as EmergencyCase["arrivalMode"], assignedDoctor: "", location: "", notes: "", ambulanceDispatched: false });
  const inp = "w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none";
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...f, age: Number(f.age) } as any); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Patient Name</label><input className={inp} value={f.patientName} onChange={set("patientName")} required /></div>
        <div><label className="text-xs font-medium">Age</label><input type="number" className={inp} value={f.age} onChange={set("age")} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Gender</label><select className={inp} value={f.gender} onChange={set("gender")}><option>Male</option><option>Female</option></select></div>
        <div><label className="text-xs font-medium">Contact</label><input className={inp} value={f.contact} onChange={set("contact")} /></div>
      </div>
      <div><label className="text-xs font-medium">Chief Complaint</label><input className={inp} value={f.chiefComplaint} onChange={set("chiefComplaint")} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Triage Level</label><select className={inp} value={f.triageLevel} onChange={set("triageLevel")}><option>Red</option><option>Orange</option><option>Yellow</option><option>Green</option></select></div>
        <div><label className="text-xs font-medium">Arrival Mode</label><select className={inp} value={f.arrivalMode} onChange={set("arrivalMode")}><option>Walk-in</option><option>Ambulance</option><option>Police</option><option>Referral</option></select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Assigned Doctor</label><input className={inp} value={f.assignedDoctor} onChange={set("assignedDoctor")} /></div>
        <div><label className="text-xs font-medium">Location / Bay</label><input className={inp} value={f.location} onChange={set("location")} /></div>
      </div>
      <div><label className="text-xs font-medium">Notes</label><textarea className={inp} value={f.notes} onChange={set("notes")} rows={2} /></div>
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white">Register</Button>
      </div>
    </form>
  );
}
