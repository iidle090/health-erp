import React, { useState } from "react";
import { Activity, AlertTriangle, Heart, Wind, Thermometer, Droplets, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ICUPatient {
  id: string; name: string; age: number; gender: string; bed: string;
  diagnosis: string; admittedAt: string; assignedNurse: string;
  ventilator: boolean; ventilatorMode?: string; peep?: number; fio2?: number;
  vitals: { bp: string; hr: number; temp: number; spo2: number; rr: number; map: number };
  trend: "Improving" | "Stable" | "Deteriorating";
  alerts: string[]; drips: string[];
  gcsScore: number; pupilResponse: string;
}

const INITIAL: ICUPatient[] = [];

const TREND_CFG = {
  Improving:    { cls: "text-green-600 bg-green-50 border-green-200", Icon: TrendingUp },
  Stable:       { cls: "text-amber-600 bg-amber-50 border-amber-200", Icon: Minus },
  Deteriorating:{ cls: "text-red-600 bg-red-50 border-red-200", Icon: TrendingDown },
};

function VitalBadge({ label, value, unit, warn }: { label: string; value: string | number; unit: string; warn?: boolean }) {
  return (
    <div className={`rounded-lg border p-2 text-center ${warn ? "border-red-300 bg-red-50" : "border-border bg-card"}`}>
      <p className={`text-base font-bold ${warn ? "text-red-600" : "text-foreground"}`}>{value}<span className="text-xs font-normal ml-0.5">{unit}</span></p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

export function DoctorCriticalCare() {
  const { toast } = useToast();
  const [patients, setPatients] = useState<ICUPatient[]>(INITIAL);
  const [selected, setSelected] = useState<ICUPatient | null>(null);
  const [note, setNote] = useState("");

  const updateTrend = (id: string, trend: ICUPatient["trend"]) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, trend } : p));
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, trend } : prev);
  };

  const critCount = patients.filter(p => p.trend === "Deteriorating" || p.alerts.length > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Activity className="h-6 w-6 text-red-600" />ICU / Critical Care</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time monitoring of intensive care patients</p>
        </div>
        {critCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">{critCount} critical alert{critCount > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* ICU Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "ICU Beds Occupied", value: `${patients.length}/3`, cls: "text-foreground" },
          { label: "On Ventilator", value: patients.filter(p => p.ventilator).length, cls: "text-amber-600" },
          { label: "Deteriorating", value: patients.filter(p => p.trend === "Deteriorating").length, cls: "text-red-600" },
          { label: "Improving", value: patients.filter(p => p.trend === "Improving").length, cls: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Patient list */}
        <div className="space-y-3">
          {patients.map(p => {
            const trend = TREND_CFG[p.trend];
            const TrendIcon = trend.Icon;
            return (
              <div key={p.id} onClick={() => setSelected(p)}
                className={`rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === p.id ? "border-[#8B1A2F] ring-1 ring-[#8B1A2F]/20" : "border-border"} ${p.alerts.length > 0 ? "bg-red-50/30" : "bg-card"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#8B1A2F] bg-[#fdf2f4] px-2 py-0.5 rounded-full">{p.bed}</span>
                    <div>
                      <p className="font-semibold text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.age}y · {p.gender}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${trend.cls}`}>
                    <TrendIcon className="h-3 w-3" />{p.trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2 truncate">{p.diagnosis}</p>
                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <VitalBadge label="BP" value={p.vitals.bp} unit="" warn={p.vitals.map < 65} />
                  <VitalBadge label="HR" value={p.vitals.hr} unit="bpm" warn={p.vitals.hr > 110 || p.vitals.hr < 50} />
                  <VitalBadge label="SpO₂" value={p.vitals.spo2} unit="%" warn={p.vitals.spo2 < 94} />
                  <VitalBadge label="Temp" value={p.vitals.temp} unit="°C" warn={p.vitals.temp > 38.5} />
                </div>
                {p.alerts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {p.alerts.map(a => (
                      <div key={a} className="flex items-center gap-1.5 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />{a}
                      </div>
                    ))}
                  </div>
                )}
                {p.ventilator && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 rounded-lg px-2 py-1">
                    <Wind className="h-3 w-3" />Ventilator: {p.ventilatorMode} | PEEP {p.peep} | FiO₂ {p.fio2}%
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 h-fit">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">{selected.name}</h3>
              <div className="flex gap-2">
                {(["Improving", "Stable", "Deteriorating"] as const).map(t => (
                  <button key={t} onClick={() => updateTrend(selected.id, t)}
                    className={`text-xs px-2 py-1 rounded-lg border transition-colors ${selected.trend === t ? "bg-[#8B1A2F] text-white border-[#8B1A2F]" : "border-border text-muted-foreground hover:border-[#8B1A2F]/40"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs space-y-1 text-muted-foreground">
              <p><span className="font-medium text-foreground">Diagnosis:</span> {selected.diagnosis}</p>
              <p><span className="font-medium text-foreground">Admitted:</span> {selected.admittedAt}</p>
              <p><span className="font-medium text-foreground">Nurse:</span> {selected.assignedNurse}</p>
              <p><span className="font-medium text-foreground">GCS:</span> {selected.gcsScore}/15 · <span className="font-medium text-foreground">Pupils:</span> {selected.pupilResponse}</p>
            </div>

            <div>
              <p className="text-xs font-semibold mb-2">Vitals</p>
              <div className="grid grid-cols-3 gap-2">
                <VitalBadge label="BP" value={selected.vitals.bp} unit="" warn={selected.vitals.map < 65} />
                <VitalBadge label="HR" value={selected.vitals.hr} unit="bpm" warn={selected.vitals.hr > 110} />
                <VitalBadge label="SpO₂" value={selected.vitals.spo2} unit="%" warn={selected.vitals.spo2 < 94} />
                <VitalBadge label="Temp" value={selected.vitals.temp} unit="°C" warn={selected.vitals.temp > 38.5} />
                <VitalBadge label="RR" value={selected.vitals.rr} unit="/min" warn={selected.vitals.rr > 20} />
                <VitalBadge label="MAP" value={selected.vitals.map} unit="mmHg" warn={selected.vitals.map < 65} />
              </div>
            </div>

            {selected.ventilator && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                <p className="text-xs font-semibold text-amber-700 mb-1.5">Ventilator Settings</p>
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div><p className="font-bold text-amber-800">{selected.ventilatorMode}</p><p className="text-amber-600">Mode</p></div>
                  <div><p className="font-bold text-amber-800">{selected.peep} cmH₂O</p><p className="text-amber-600">PEEP</p></div>
                  <div><p className="font-bold text-amber-800">{selected.fio2}%</p><p className="text-amber-600">FiO₂</p></div>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold mb-1.5">Active Drips & Medications</p>
              <div className="space-y-1">
                {selected.drips.map(d => (
                  <div key={d} className="flex items-center gap-1.5 text-xs text-foreground bg-muted/40 rounded-lg px-2.5 py-1.5">
                    <Droplets className="h-3 w-3 text-blue-500 shrink-0" />{d}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-1.5">Doctor's Note</p>
              <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add clinical decision note…"
                className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none resize-none" />
              <Button size="sm" onClick={() => { toast({ title: "Note saved" }); setNote(""); }} className="mt-2 bg-[#8B1A2F] hover:bg-[#6d1424] text-white text-xs h-7">Save Note</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border h-64 text-muted-foreground">
            <Activity className="h-8 w-8 mb-2 opacity-30" />
            <p className="text-sm">Select a patient to view details</p>
          </div>
        )}
      </div>
    </div>
  );
}
