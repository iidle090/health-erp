import React, { useState } from "react";
import { Scissors, Plus, Clock, CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp, Calendar, User, FileText, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Surgery {
  id: string; patientName: string; patientId: string; age: number;
  procedure: string; surgeon: string; assistants: string;
  orRoom: string; scheduledDate: string; scheduledTime: string;
  duration: number; anesthesia: string; priority: "Elective" | "Urgent" | "Emergency";
  status: "Scheduled" | "Pre-Op" | "In Progress" | "Post-Op" | "Completed" | "Cancelled";
  preOpChecklist: Record<string, boolean>; surgicalNotes: string; postOpNotes: string;
}

const INITIAL: Surgery[] = [];

const STATUS_CFG: Record<Surgery["status"], { cls: string; dot: string }> = {
  Scheduled: { cls: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  "Pre-Op":  { cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  "In Progress": { cls: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500 animate-pulse" },
  "Post-Op": { cls: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
  Completed: { cls: "bg-gray-100 text-gray-600 border-gray-200", dot: "bg-gray-400" },
  Cancelled: { cls: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-400" },
};
const PRIORITY_CFG = { Elective: "bg-blue-50 text-blue-700", Urgent: "bg-amber-50 text-amber-700", Emergency: "bg-red-50 text-red-700" };
const PRE_OP_ITEMS = ["Consent signed", "NPO confirmed", "Blood work done", "Imaging reviewed", "Anesthesia assessment"];

export function DoctorSurgeries() {
  const { toast } = useToast();
  const [surgeries, setSurgeries] = useState<Surgery[]>(INITIAL);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");
  const [showNew, setShowNew] = useState(false);
  const [editNotes, setEditNotes] = useState<{ id: string; field: "surgicalNotes" | "postOpNotes"; value: string } | null>(null);

  const upcoming = surgeries.filter(s => !["Completed", "Cancelled"].includes(s.status));
  const completed = surgeries.filter(s => ["Completed", "Cancelled"].includes(s.status));

  const updateChecklist = (id: string, item: string, val: boolean) =>
    setSurgeries(prev => prev.map(s => s.id === id ? { ...s, preOpChecklist: { ...s.preOpChecklist, [item]: val } } : s));

  const advanceStatus = (s: Surgery) => {
    const order: Surgery["status"][] = ["Scheduled", "Pre-Op", "In Progress", "Post-Op", "Completed"];
    const i = order.indexOf(s.status);
    if (i < order.length - 1) setSurgeries(prev => prev.map(x => x.id === s.id ? { ...x, status: order[i + 1] } : x));
  };

  const saveNotes = () => {
    if (!editNotes) return;
    setSurgeries(prev => prev.map(s => s.id === editNotes.id ? { ...s, [editNotes.field]: editNotes.value } : s));
    toast({ title: "Notes saved" });
    setEditNotes(null);
  };

  const list = tab === "upcoming" ? upcoming : completed;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Scissors className="h-6 w-6 text-[#8B1A2F]" />Surgeries & Theatre</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage surgical schedules, pre/post-op workflows</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white gap-2"><Plus className="h-4 w-4" />Schedule Surgery</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Scheduled", value: surgeries.filter(s => s.status === "Scheduled").length, cls: "text-blue-600" },
          { label: "In Progress", value: surgeries.filter(s => s.status === "In Progress").length, cls: "text-green-600" },
          { label: "Post-Op", value: surgeries.filter(s => s.status === "Post-Op").length, cls: "text-purple-600" },
          { label: "Completed", value: surgeries.filter(s => s.status === "Completed").length, cls: "text-gray-500" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-3xl font-bold ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(["upcoming", "completed"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "upcoming" ? `Active (${upcoming.length})` : `Past (${completed.length})`}
          </button>
        ))}
      </div>

      {/* Surgery cards */}
      <div className="space-y-3">
        {list.map(s => {
          const cfg = STATUS_CFG[s.status];
          const isExpanded = expanded === s.id;
          const checkedCount = Object.values(s.preOpChecklist).filter(Boolean).length;
          const totalCheck = Object.keys(s.preOpChecklist).length;
          return (
            <div key={s.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf2f4] text-[#8B1A2F] font-bold text-sm">
                      {s.patientName.split(" ").map(n => n[0]).join("").slice(0,2)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{s.patientName}</p>
                      <p className="text-xs text-muted-foreground">{s.patientId} · {s.age}y · {s.procedure}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_CFG[s.priority]}`}>{s.priority}</span>
                    <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.cls}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />{s.status}
                    </span>
                    <button onClick={() => setExpanded(isExpanded ? null : s.id)} className="text-muted-foreground hover:text-foreground ml-1">
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{s.scheduledDate} {s.scheduledTime}</span>
                  <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{s.duration} min</span>
                  <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{s.orRoom}</span>
                  <span>{s.anesthesia} anesthesia</span>
                </div>
                {/* Pre-op progress bar */}
                {!["Completed", "Cancelled"].includes(s.status) && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Pre-op checklist</span>
                      <span className={checkedCount === totalCheck ? "text-green-600 font-medium" : "text-amber-600"}>{checkedCount}/{totalCheck}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${checkedCount === totalCheck ? "bg-green-500" : "bg-amber-400"}`} style={{ width: `${(checkedCount / totalCheck) * 100}%` }} />
                    </div>
                  </div>
                )}
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-border p-4 space-y-4 bg-muted/20">
                  {/* Pre-op checklist */}
                  {!["Completed", "Cancelled"].includes(s.status) && (
                    <div>
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1.5"><ClipboardList className="h-3.5 w-3.5 text-[#8B1A2F]" />Pre-Op Checklist</p>
                      <div className="space-y-1.5">
                        {PRE_OP_ITEMS.map(item => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={!!s.preOpChecklist[item]} onChange={e => updateChecklist(s.id, item, e.target.checked)} className="rounded" />
                            <span className="text-sm">{item}</span>
                            {s.preOpChecklist[item] && <CheckCircle2 className="h-3.5 w-3.5 text-green-600 ml-auto" />}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Surgical Notes */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-[#8B1A2F]" />Surgical Notes</p>
                      {editNotes?.id !== s.id || editNotes.field !== "surgicalNotes" ? (
                        <button onClick={() => setEditNotes({ id: s.id, field: "surgicalNotes", value: s.surgicalNotes })} className="text-xs text-[#8B1A2F] hover:underline">Edit</button>
                      ) : <button onClick={saveNotes} className="text-xs text-green-600 hover:underline font-medium">Save</button>}
                    </div>
                    {editNotes?.id === s.id && editNotes.field === "surgicalNotes" ? (
                      <textarea value={editNotes.value} onChange={e => setEditNotes(prev => prev ? { ...prev, value: e.target.value } : prev)} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none resize-none" />
                    ) : (
                      <p className="text-sm text-muted-foreground bg-background rounded-lg border border-border px-3 py-2 min-h-[60px]">{s.surgicalNotes || "No surgical notes yet."}</p>
                    )}
                  </div>

                  {/* Post-op Notes */}
                  {["Post-Op", "Completed"].includes(s.status) && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-purple-600" />Post-Op Notes</p>
                        {editNotes?.id !== s.id || editNotes.field !== "postOpNotes" ? (
                          <button onClick={() => setEditNotes({ id: s.id, field: "postOpNotes", value: s.postOpNotes })} className="text-xs text-[#8B1A2F] hover:underline">Edit</button>
                        ) : <button onClick={saveNotes} className="text-xs text-green-600 hover:underline font-medium">Save</button>}
                      </div>
                      {editNotes?.id === s.id && editNotes.field === "postOpNotes" ? (
                        <textarea value={editNotes.value} onChange={e => setEditNotes(prev => prev ? { ...prev, value: e.target.value } : prev)} rows={3} className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none resize-none" />
                      ) : (
                        <p className="text-sm text-muted-foreground bg-background rounded-lg border border-border px-3 py-2 min-h-[60px]">{s.postOpNotes || "No post-op notes yet."}</p>
                      )}
                    </div>
                  )}

                  {/* Advance status */}
                  {!["Completed", "Cancelled"].includes(s.status) && (
                    <Button size="sm" onClick={() => { advanceStatus(s); toast({ title: "Status updated" }); }} className="bg-[#8B1A2F] hover:bg-[#6d1424] text-white text-xs">
                      Advance to Next Stage →
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Schedule modal */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Schedule Surgery</h2>
              <button onClick={() => setShowNew(false)}><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <NewSurgeryForm onSubmit={data => {
              const s: Surgery = { ...data, id: `OT-${String(surgeries.length + 1).padStart(3, "0")}`, status: "Scheduled", preOpChecklist: Object.fromEntries(PRE_OP_ITEMS.map(k => [k, false])), surgicalNotes: "", postOpNotes: "" };
              setSurgeries(prev => [s, ...prev]);
              setShowNew(false);
              toast({ title: "Surgery scheduled!" });
            }} onCancel={() => setShowNew(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

function NewSurgeryForm({ onSubmit, onCancel }: { onSubmit: (d: Omit<Surgery, "id" | "status" | "preOpChecklist" | "surgicalNotes" | "postOpNotes">) => void; onCancel: () => void }) {
  const [f, setF] = useState({ patientName: "", patientId: "", age: "", procedure: "", surgeon: "Dr. Smith", assistants: "", orRoom: "OR-1", scheduledDate: "", scheduledTime: "", duration: "60", anesthesia: "General", priority: "Elective" as Surgery["priority"] });
  const inp = "w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none";
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF(p => ({ ...p, [k]: e.target.value }));
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...f, age: Number(f.age), duration: Number(f.duration) } as any); }} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Patient Name</label><input className={inp} value={f.patientName} onChange={set("patientName")} required /></div>
        <div><label className="text-xs font-medium">Patient ID</label><input className={inp} value={f.patientId} onChange={set("patientId")} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Age</label><input type="number" className={inp} value={f.age} onChange={set("age")} required /></div>
        <div><label className="text-xs font-medium">Priority</label>
          <select className={inp} value={f.priority} onChange={set("priority")}>
            <option>Elective</option><option>Urgent</option><option>Emergency</option>
          </select>
        </div>
      </div>
      <div><label className="text-xs font-medium">Procedure</label><input className={inp} value={f.procedure} onChange={set("procedure")} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="text-xs font-medium">Date</label><input type="date" className={inp} value={f.scheduledDate} onChange={set("scheduledDate")} required /></div>
        <div><label className="text-xs font-medium">Time</label><input type="time" className={inp} value={f.scheduledTime} onChange={set("scheduledTime")} required /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-xs font-medium">Duration (min)</label><input type="number" className={inp} value={f.duration} onChange={set("duration")} /></div>
        <div><label className="text-xs font-medium">OR Room</label>
          <select className={inp} value={f.orRoom} onChange={set("orRoom")}><option>OR-1</option><option>OR-2</option><option>OR-3</option></select>
        </div>
        <div><label className="text-xs font-medium">Anesthesia</label>
          <select className={inp} value={f.anesthesia} onChange={set("anesthesia")}><option>General</option><option>Spinal</option><option>Local</option><option>Regional</option></select>
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" className="flex-1 bg-[#8B1A2F] hover:bg-[#6d1424] text-white">Schedule</Button>
      </div>
    </form>
  );
}
