import React, { useState } from "react";
import { Plus, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NurseShift {
  id: number; time: string; patient: string; patientId: string; task: string;
  type: "Medication" | "Vitals" | "Wound Care" | "Assessment" | "Procedure" | "Lab Draw" | "Other";
  nurse: string; status: "Pending" | "Completed" | "In Progress";
  notes?: string;
}

const initialSchedule: NurseShift[] = [];

const typeColors: Record<string, string> = {
  Medication: "bg-[#fdf2f4] text-[#8B1A2F]",
  Vitals: "bg-amber-100 text-amber-700",
  "Wound Care": "bg-orange-100 text-orange-700",
  Assessment: "bg-amber-50 text-amber-800",
  Procedure: "bg-[#fdf2f4] text-[#8B1A2F]",
  "Lab Draw": "bg-orange-100 text-orange-700",
  Other: "bg-gray-100 text-gray-700",
};

const statusConfig = {
  Completed: { label: "Completed", cls: "bg-[#fdf2f4] text-[#8B1A2F]", dot: "bg-[#8B1A2F]" },
  "In Progress": { label: "In Progress", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-400 animate-pulse" },
  Pending: { label: "Pending", cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
};

export function NurseSchedule() {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ time: "", patient: "", patientId: "", task: "", type: "Assessment" as NurseShift["type"], notes: "" });

  const filters = ["All", "Pending", "In Progress", "Completed"];
  const displayed = schedule.filter((s) => filter === "All" || s.status === filter);

  const toggleStatus = (id: number) => {
    setSchedule((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const next: NurseShift["status"] = s.status === "Pending" ? "In Progress" : s.status === "In Progress" ? "Completed" : "Pending";
      return { ...s, status: next };
    }));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setSchedule((prev) => [...prev, { id: Date.now(), ...form, nurse: "Rebecca Mills", status: "Pending" }]);
    setForm({ time: "", patient: "", patientId: "", task: "", type: "Assessment", notes: "" });
    setAddOpen(false);
  };

  const counts = { All: schedule.length, Pending: schedule.filter((s) => s.status === "Pending").length, "In Progress": schedule.filter((s) => s.status === "In Progress").length, Completed: schedule.filter((s) => s.status === "Completed").length };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Schedule Nursing</h1>
          <p className="text-sm text-muted-foreground mt-1">Day Shift — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2"><Plus className="h-4 w-4" />Add Task</Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {(["Pending", "In Progress", "Completed"] as const).map((s) => (
          <div key={s} className={`rounded-xl border p-4 cursor-pointer transition-all ${filter === s ? "border-[#8B1A2F] bg-[#fdf2f4]" : "border-border bg-card"}`} onClick={() => setFilter(filter === s ? "All" : s)}>
            <p className="text-xs text-muted-foreground">{s}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{counts[s]}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="flex gap-2 p-4 border-b border-border/50">
          {filters.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{f}</button>
          ))}
        </div>
        <div className="divide-y divide-border/40">
          {displayed.map((s) => {
            const sc = statusConfig[s.status];
            return (
              <div key={s.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors ${s.status === "Completed" ? "opacity-60" : ""}`}>
                <div className="flex items-center gap-1.5 w-24 flex-shrink-0">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">{s.time}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`text-sm font-medium ${s.status === "Completed" ? "line-through text-muted-foreground" : "text-foreground"}`}>{s.task}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColors[s.type] ?? "bg-gray-100 text-gray-700"}`}>{s.type}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.patient}{s.patientId ? ` · ${s.patientId}` : ""}</p>
                  {s.notes && <p className="text-xs text-muted-foreground italic">{s.notes}</p>}
                </div>
                <button onClick={() => toggleStatus(s.id)} className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${sc.cls}`}>
                  {s.status === "Completed" ? <CheckCircle className="h-3.5 w-3.5" /> : <span className={`h-2 w-2 rounded-full ${sc.dot}`} />}
                  {sc.label}
                </button>
              </div>
            );
          })}
          {displayed.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No tasks for this filter.</div>}
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Nursing Task</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Time</Label><Input required type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label>Type</Label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as NurseShift["type"] }))} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {["Medication","Vitals","Wound Care","Assessment","Procedure","Lab Draw","Other"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Patient Name</Label><Input required value={form.patient} onChange={(e) => setForm((f) => ({ ...f, patient: e.target.value }))} placeholder="Patient name" /></div>
            <div className="space-y-1.5"><Label>Patient ID</Label><Input value={form.patientId} onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))} placeholder="PT-XXXXX" /></div>
            <div className="space-y-1.5"><Label>Task Description *</Label><Input required value={form.task} onChange={(e) => setForm((f) => ({ ...f, task: e.target.value }))} placeholder="e.g. Administer Lisinopril 10mg" /></div>
            <div className="space-y-1.5"><Label>Notes (optional)</Label><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Any special instructions..." /></div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button type="submit">Add Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
