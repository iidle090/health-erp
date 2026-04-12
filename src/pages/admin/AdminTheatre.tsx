import React, { useState } from "react";
import { Scissors, Calendar, Clock, User, Plus, X, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Surgery {
  id: string; patientName: string; patientId: string; procedure: string;
  surgeon: string; orRoom: "OR-1" | "OR-2" | "OR-3" | "OR-4";
  scheduledDate: string; scheduledTime: string; duration: number;
  anesthesia: string; priority: "Elective" | "Urgent" | "Emergency";
  status: "Scheduled" | "Pre-Op" | "In Progress" | "Completed" | "Cancelled";
}

const INITIAL: Surgery[] = [];

const OR_ROOMS = ["OR-1", "OR-2", "OR-3", "OR-4"] as const;
const STATUS_CFG: Record<Surgery["status"], string> = {
  Scheduled:    "bg-blue-50 text-blue-700 border-blue-200",
  "Pre-Op":     "bg-amber-50 text-amber-700 border-amber-200",
  "In Progress":"bg-green-50 text-green-700 border-green-200",
  Completed:    "bg-gray-100 text-gray-600 border-gray-200",
  Cancelled:    "bg-red-50 text-red-600 border-red-200",
};
const PRIORITY_CFG = { Elective: "text-blue-700 bg-blue-50", Urgent: "text-amber-700 bg-amber-50", Emergency: "text-red-700 bg-red-50" };

export function AdminTheatre() {
  const { toast } = useToast();
  const [surgeries, setSurgeries] = useState<Surgery[]>(INITIAL);
  const [showNew, setShowNew] = useState(false);
  const [viewDate, setViewDate] = useState("2026-04-09");

  const today = surgeries.filter(s => s.scheduledDate === viewDate);
  const upcoming = surgeries.filter(s => s.scheduledDate > viewDate && !["Completed","Cancelled"].includes(s.status));
  const inProgress = surgeries.filter(s => s.status === "In Progress");

  // OR utilization
  const orUtil = OR_ROOMS.map(or => ({
    or,
    cases: surgeries.filter(s => s.orRoom === or && !["Cancelled"].includes(s.status)),
    active: surgeries.find(s => s.orRoom === or && s.status === "In Progress"),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Scissors className="h-6 w-6 text-[#8B1A2F]" />Theatre / OT Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Operating room schedule, allocation and surgical overview</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2"><Plus className="h-4 w-4" />Schedule Surgery</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Surgeries", value: surgeries.length, cls: "text-foreground" },
          { label: "In Progress Now", value: inProgress.length, cls: "text-green-600" },
          { label: "Upcoming", value: upcoming.length, cls: "text-blue-600" },
          { label: "Completed Today", value: surgeries.filter(s => s.status === "Completed" && s.scheduledDate === viewDate).length, cls: "text-gray-500" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* OR Status Grid */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Operating Room Status</h2>
        <div className="grid grid-cols-4 gap-4">
          {orUtil.map(({ or, cases, active }) => (
            <div key={or} className={`rounded-xl border p-4 ${active ? "border-green-300 bg-green-50" : "border-border bg-card"}`}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-foreground">{or}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${active ? "bg-green-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  {active ? "In Use" : "Available"}
                </span>
              </div>
              {active ? (
                <div>
                  <p className="text-sm font-medium text-foreground truncate">{active.procedure}</p>
                  <p className="text-xs text-muted-foreground">{active.patientName}</p>
                  <p className="text-xs text-muted-foreground mt-1">{active.surgeon} · {active.duration}min</p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{cases.length} scheduled</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Date selector + schedule */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Schedule</h2>
          <input type="date" value={viewDate} onChange={e => setViewDate(e.target.value)} className="rounded-lg border border-border px-3 py-1.5 text-sm bg-background focus:outline-none" />
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{["ID","Patient","Procedure","Surgeon","OR","Time","Duration","Priority","Status"].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(viewDate ? surgeries.filter(s => s.scheduledDate === viewDate) : surgeries).map(s => (
                <tr key={s.id} className="hover:bg-muted/20">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{s.id}</td>
                  <td className="px-4 py-3"><p className="font-medium">{s.patientName}</p><p className="text-xs text-muted-foreground">{s.patientId}</p></td>
                  <td className="px-4 py-3 max-w-[180px]"><p className="truncate text-sm">{s.procedure}</p></td>
                  <td className="px-4 py-3 text-sm">{s.surgeon}</td>
                  <td className="px-4 py-3"><span className="font-semibold text-[#8B1A2F]">{s.orRoom}</span></td>
                  <td className="px-4 py-3 text-sm">{s.scheduledTime}</td>
                  <td className="px-4 py-3 text-sm">{s.duration}m</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_CFG[s.priority]}`}>{s.priority}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_CFG[s.status]}`}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {surgeries.filter(s => s.scheduledDate === viewDate).length === 0 && (
            <div className="py-10 text-center text-muted-foreground text-sm">No surgeries scheduled for {viewDate}</div>
          )}
        </div>
      </div>

      {/* New Surgery Modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Schedule Surgery</h2>
              <button onClick={() => setShowNew(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <AdminSurgeryForm onSubmit={data => {
              setSurgeries(prev => [{ ...data, id: `OT-${String(prev.length + 1).padStart(3,"0")}`, status: "Scheduled" }, ...prev]);
              setShowNew(false); toast({ title: "Surgery scheduled!" });
            }} onCancel={() => setShowNew(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function AdminSurgeryForm({ onSubmit, onCancel }: { onSubmit: (d: Omit<Surgery,"id"|"status">) => void; onCancel: () => void }) {
  const [f, setF] = useState({ patientName:"", patientId:"", procedure:"", surgeon:"", orRoom:"OR-1" as Surgery["orRoom"], scheduledDate:"", scheduledTime:"", duration:"60", anesthesia:"General", priority:"Elective" as Surgery["priority"] });
  const inp = "w-full mt-1 rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none";
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...f, duration: Number(f.duration) } as any); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Patient Name</label><input className={inp} value={f.patientName} onChange={set("patientName")} required /></div>
        <div><label className="text-xs font-medium">Patient ID</label><input className={inp} value={f.patientId} onChange={set("patientId")} /></div>
      </div>
      <div><label className="text-xs font-medium">Procedure</label><input className={inp} value={f.procedure} onChange={set("procedure")} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Surgeon</label><input className={inp} value={f.surgeon} onChange={set("surgeon")} required /></div>
        <div><label className="text-xs font-medium">OR Room</label><select className={inp} value={f.orRoom} onChange={set("orRoom")}>{OR_ROOMS.map(r=><option key={r}>{r}</option>)}</select></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Date</label><input type="date" className={inp} value={f.scheduledDate} onChange={set("scheduledDate")} required /></div>
        <div><label className="text-xs font-medium">Time</label><input type="time" className={inp} value={f.scheduledTime} onChange={set("scheduledTime")} required /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-xs font-medium">Duration (min)</label><input type="number" className={inp} value={f.duration} onChange={set("duration")} /></div>
        <div><label className="text-xs font-medium">Anesthesia</label><select className={inp} value={f.anesthesia} onChange={set("anesthesia")}><option>General</option><option>Spinal</option><option>Local</option></select></div>
        <div><label className="text-xs font-medium">Priority</label><select className={inp} value={f.priority} onChange={set("priority")}><option>Elective</option><option>Urgent</option><option>Emergency</option></select></div>
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">Schedule</Button>
      </div>
    </form>
  );
}
