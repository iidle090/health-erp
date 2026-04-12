import React, { useState } from "react";
import { CheckCircle, Circle, AlertTriangle } from "lucide-react";
import { usePatientStore } from "@/context/PatientStore";

export function NurseTasks() {
  const { patients, updatePatient } = usePatientStore();

  const allTasks = patients.flatMap((p) =>
    p.tasks.map((t, idx) => ({ ...t, patientName: p.name, patientId: p.id, taskIndex: idx }))
  );

  const [filter, setFilter] = useState<"All" | "Pending" | "Completed" | "urgent">("All");

  const displayed = allTasks.filter((t) => {
    if (filter === "All") return true;
    if (filter === "Pending") return !t.completed;
    if (filter === "Completed") return t.completed;
    if (filter === "urgent") return !t.completed && t.priority === "urgent";
    return true;
  });

  const toggleTask = (patientId: string, taskIndex: number, completed: boolean) => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return;
    const updatedTasks = patient.tasks.map((t, i) => i === taskIndex ? { ...t, completed: !completed } : t);
    updatePatient(patientId, { tasks: updatedTasks });
  };

  const pending = allTasks.filter((t) => !t.completed);
  const urgent = allTasks.filter((t) => !t.completed && t.priority === "urgent");
  const completed = allTasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tasks & Shift Management</h1>
        <p className="text-sm text-muted-foreground mt-1">All patient care tasks for the current shift</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pending.length, cls: "text-orange-700", bg: "bg-orange-50", filter: "Pending" as const },
          { label: "Urgent", value: urgent.length, cls: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]", filter: "urgent" as const },
          { label: "Completed", value: completed.length, cls: "text-amber-700", bg: "bg-amber-50", filter: "Completed" as const },
        ].map((s) => (
          <button key={s.label} onClick={() => setFilter(filter === s.filter ? "All" : s.filter)} className={`rounded-xl border p-4 text-left transition-all ${filter === s.filter ? "border-[#8B1A2F] shadow-sm bg-[#fdf2f4]" : "border-border bg-card"}`}>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </button>
        ))}
      </div>

      {urgent.length > 0 && (
        <div className="rounded-xl border border-[#f0d0d6] bg-[#fdf2f4] p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-[#8B1A2F] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[#8B1A2F]">{urgent.length} urgent task{urgent.length > 1 ? "s" : ""} pending</p>
            <p className="text-xs text-[#8B1A2F]/80 mt-0.5">Complete urgent tasks immediately. Tap task to mark as complete.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(["All", "Pending", "urgent", "Completed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === f ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f === "urgent" ? "🚨 Urgent" : f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm divide-y divide-border/40">
        {displayed.map((t, i) => (
          <div key={i} className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors ${t.completed ? "opacity-60" : ""}`}>
            <button onClick={() => toggleTask(t.patientId, t.taskIndex, t.completed)} className="flex-shrink-0">
              {t.completed
                ? <CheckCircle className="h-5 w-5 text-[#8B1A2F]" />
                : <Circle className={`h-5 w-5 ${t.priority === "urgent" ? "text-red-500" : "text-muted-foreground"}`} />
              }
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${t.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.task}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.patientName} · {t.patientId} · {t.time}</p>
            </div>
            {!t.completed && t.priority === "urgent" && (
              <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[#fdf2f4] text-[#8B1A2F] flex-shrink-0">
                🚨 Urgent
              </span>
            )}
          </div>
        ))}
        {displayed.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No tasks in this category.</div>}
      </div>
    </div>
  );
}
