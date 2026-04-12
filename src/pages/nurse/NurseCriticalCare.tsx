import React, { useState } from "react";
import { Activity, AlertTriangle, Wind, Droplets, TrendingUp, TrendingDown, Minus, Clock, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ICUPatient {
  id: string; name: string; age: number; gender: string; bed: string;
  diagnosis: string; admittedAt: string; assignedNurse: string;
  ventilator: boolean; ventilatorMode?: string; peep?: number; fio2?: number;
  vitals: { bp: string; hr: number; temp: number; spo2: number; rr: number };
  trend: "Improving" | "Stable" | "Deteriorating";
  alerts: string[]; drips: string[]; gcsScore: number;
  nursingNotes: { time: string; note: string; nurse: string }[];
  lastVitalsUpdate: string;
}

const ICU_KEY = "health_erp_icu_nurse_v3";
function load(): ICUPatient[] { try { const s = localStorage.getItem(ICU_KEY); return s ? JSON.parse(s) : []; } catch { return []; } }
function save(d: ICUPatient[]) { try { localStorage.setItem(ICU_KEY, JSON.stringify(d)); } catch {} }

const INITIAL: ICUPatient[] = [];

const TREND_CFG = {
  Improving:    { cls: "text-green-600 bg-green-50 border-green-200", Icon: TrendingUp },
  Stable:       { cls: "text-amber-600 bg-amber-50 border-amber-200", Icon: Minus },
  Deteriorating:{ cls: "text-red-600 bg-red-50 border-red-200", Icon: TrendingDown },
};

export function NurseCriticalCare() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<ICUPatient[]>(load);
  const [selected, setSelected] = useState<ICUPatient | null>(null);
  const [newNote, setNewNote] = useState("");
  const [showVitals, setShowVitals] = useState(false);
  const [vitalsForm, setVitalsForm] = useState({ bp: "", hr: "", temp: "", spo2: "", rr: "" });

  const save_ = (d: ICUPatient[]) => { save(d); setPatients(d); };

  const addNote = () => {
    if (!selected || !newNote.trim()) return;
    const note = { time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }), note: newNote, nurse: "Nurse (You)" };
    const updated = patients.map(p => p.id === selected.id ? { ...p, nursingNotes: [note, ...p.nursingNotes] } : p);
    save_(updated);
    setSelected(prev => prev ? { ...prev, nursingNotes: [note, ...prev.nursingNotes] } : prev);
    setNewNote("");
    toast({ title: "Note added" });
  };

  const updateVitals = () => {
    if (!selected) return;
    const updated = patients.map(p => p.id === selected.id ? {
      ...p,
      vitals: { bp: vitalsForm.bp || p.vitals.bp, hr: Number(vitalsForm.hr) || p.vitals.hr, temp: Number(vitalsForm.temp) || p.vitals.temp, spo2: Number(vitalsForm.spo2) || p.vitals.spo2, rr: Number(vitalsForm.rr) || p.vitals.rr },
      lastVitalsUpdate: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    } : p);
    save_(updated);
    setSelected(updated.find(p => p.id === selected.id) || null);
    setShowVitals(false);
    setVitalsForm({ bp: "", hr: "", temp: "", spo2: "", rr: "" });
    toast({ title: "Vitals updated" });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-red-600" />ICU / Critical Care</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Monitor and care for intensive care patients</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
          <Clock className="h-3.5 w-3.5" />Live monitoring — refresh every round
        </div>
      </div>

      {/* Alert banner */}
      {patients.some(p => p.alerts.length > 0) && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700">Active Alerts</p>
            {patients.flatMap(p => p.alerts.map(a => `${p.name} (${p.bed}): ${a}`)).map(a => (
              <p key={a} className="text-xs text-red-600">• {a}</p>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Beds Occupied", value: `${patients.length}/3`, cls: "text-foreground" },
          { label: "On Ventilator", value: patients.filter(p => p.ventilator).length, cls: "text-amber-600" },
          { label: "Critical Alerts", value: patients.reduce((s, p) => s + p.alerts.length, 0), cls: "text-red-600" },
          { label: "Improving", value: patients.filter(p => p.trend === "Improving").length, cls: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* ICU patient cards */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">ICU Patients</h2>
          {patients.map(p => {
            const trend = TREND_CFG[p.trend];
            const TrendIcon = trend.Icon;
            return (
              <div key={p.id} onClick={() => setSelected(p)}
                className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === p.id ? "border-[#8B1A2F] ring-1 ring-[#8B1A2F]/20" : p.alerts.length > 0 ? "border-red-300 bg-red-50/40" : "border-border bg-card"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8B1A2F] bg-[#fdf2f4] px-2 py-0.5 rounded-full">{p.bed}</span>
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground">{p.age}y · Nurse: {p.assignedNurse}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${trend.cls}`}>
                    <TrendIcon className="h-3 w-3" />{p.trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate">{p.diagnosis}</p>
                <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
                  {[
                    { l: "BP", v: p.vitals.bp, w: false },
                    { l: "HR", v: `${p.vitals.hr}bpm`, w: p.vitals.hr > 110 },
                    { l: "SpO₂", v: `${p.vitals.spo2}%`, w: p.vitals.spo2 < 94 },
                    { l: "Temp", v: `${p.vitals.temp}°C`, w: p.vitals.temp > 38.5 },
                    { l: "RR", v: `${p.vitals.rr}/m`, w: p.vitals.rr > 20 },
                  ].map(v => (
                    <div key={v.l} className={`rounded p-1 border ${v.w ? "border-red-300 bg-red-50" : "border-border"}`}>
                      <p className={`font-bold ${v.w ? "text-red-600" : "text-foreground"}`}>{v.v}</p>
                      <p className="text-muted-foreground">{v.l}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
                  {p.ventilator && <span className="flex items-center gap-1 text-amber-600"><Wind className="h-3 w-3" />Ventilator ({p.ventilatorMode})</span>}
                  <span className="ml-auto">Vitals @ {p.lastVitalsUpdate}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Nursing actions panel */}
        {selected ? (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{selected.name} — {selected.bed}</h3>
              <Button size="sm" variant="outline" onClick={() => setShowVitals(!showVitals)} className="text-xs h-7 gap-1">
                <Activity className="h-3 w-3" />Update Vitals
              </Button>
            </div>

            {showVitals && (
              <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
                <p className="text-xs font-semibold">Record New Vitals</p>
                <div className="grid grid-cols-2 gap-2">
                  {[["bp","BP (e.g. 120/80)"],["hr","Heart Rate (bpm)"],["temp","Temp (°C)"],["spo2","SpO₂ (%)"],["rr","Resp Rate (/min)"]].map(([k,l]) => (
                    <div key={k}>
                      <label className="text-[10px] text-muted-foreground">{l}</label>
                      <input className="w-full rounded border border-border px-2 py-1 text-xs bg-background focus:outline-none" value={vitalsForm[k as keyof typeof vitalsForm]} onChange={e => setVitalsForm(prev => ({ ...prev, [k]: e.target.value }))} />
                    </div>
                  ))}
                </div>
                <Button size="sm" onClick={updateVitals} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white text-xs h-7 w-full">Save Vitals</Button>
              </div>
            )}

            {/* Active drips */}
            <div>
              <p className="text-xs font-semibold mb-1.5">Active Drips</p>
              {selected.drips.map(d => (
                <div key={d} className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-800 rounded-lg px-2.5 py-1.5 mb-1">
                  <Droplets className="h-3 w-3" />{d}
                </div>
              ))}
            </div>

            {/* Nursing notes */}
            <div>
              <p className="text-xs font-semibold mb-1.5">Nursing Notes</p>
              <div className="space-y-1.5 mb-2 max-h-40 overflow-y-auto">
                {selected.nursingNotes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
                {selected.nursingNotes.map((n, i) => (
                  <div key={i} className="rounded-lg bg-muted/40 px-2.5 py-1.5">
                    <p className="text-xs font-medium text-foreground">{n.time} — {n.nurse}</p>
                    <p className="text-xs text-muted-foreground">{n.note}</p>
                  </div>
                ))}
              </div>
              <textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={2} placeholder="Add nursing note…"
                className="w-full rounded-lg border border-border px-3 py-2 text-xs bg-background focus:outline-none resize-none" />
              <Button size="sm" onClick={addNote} className="mt-1.5 bg-[#8B1A2F] hover:bg-[#6d1424] text-white text-xs h-7 w-full">Add Note</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border h-64 text-muted-foreground">
            <Activity className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Select a patient to manage care</p>
          </div>
        )}
      </div>
    </div>
  );
}
