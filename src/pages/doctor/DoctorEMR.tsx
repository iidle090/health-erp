import React, { useState, useEffect } from "react";
import { Search, FileText, Clock, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCrossPortal } from "@/context/CrossPortalStore";

const NOTES_KEY = "health_erp_emr_notes_v2";

interface EMRNote {
  id: string; ticketNo: string; patientId: string;
  type: "SOAP" | "Progress" | "Diagnosis" | "Referral" | "General";
  content: string; createdAt: string; author: string;
}

function loadNotes(): EMRNote[] {
  try { const s = localStorage.getItem(NOTES_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveNotes(n: EMRNote[]) {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(n)); } catch {}
}

const typeColors: Record<string, string> = {
  SOAP: "bg-[#fdf2f4] text-[#8B1A2F]",
  Progress: "bg-amber-100 text-amber-700",
  Diagnosis: "bg-orange-100 text-orange-700",
  Referral: "bg-blue-100 text-blue-700",
  General: "bg-gray-100 text-gray-600",
};

export function DoctorEMR() {
  const { tickets } = useCrossPortal();
  const [search, setSearch] = useState("");
  const [selectedTicketNo, setSelectedTicketNo] = useState<string | null>(null);
  const [notes, setNotes] = useState<EMRNote[]>(loadNotes);
  const [addOpen, setAddOpen] = useState(false);
  const [noteType, setNoteType] = useState<EMRNote["type"]>("SOAP");
  const [content, setContent] = useState("");

  const myPatients = tickets.filter((t) => ["Waiting Doctor", "In Consultation", "Completed"].includes(t.status));
  const filtered = myPatients.filter((t) =>
    t.patientName.toLowerCase().includes(search.toLowerCase()) || t.patientId.toLowerCase().includes(search.toLowerCase())
  );

  const selected = myPatients.find((t) => t.ticketNo === selectedTicketNo);
  const patientNotes = notes.filter((n) => n.ticketNo === selectedTicketNo);

  const addNote = () => {
    if (!content.trim() || !selectedTicketNo || !selected) return;
    const note: EMRNote = {
      id: `N-${Date.now()}`,
      ticketNo: selectedTicketNo,
      patientId: selected.patientId,
      type: noteType,
      content: content.trim(),
      createdAt: new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      author: "Dr. Olivia Patel",
    };
    const updated = [note, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setContent("");
    setAddOpen(false);
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-8rem)]">
      {/* Left — patient list */}
      <div className="w-72 flex-shrink-0 flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">EMR</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Electronic Medical Records</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search patients..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex-1 rounded-xl border border-border bg-card shadow-sm overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 px-4 text-center">
              <FileText className="h-8 w-8 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">No patients yet</p>
              <p className="text-xs text-muted-foreground mt-1">Patients appear here after nurse triage sends them to you.</p>
            </div>
          ) : (
            filtered.map((t) => (
              <button key={t.ticketNo} onClick={() => setSelectedTicketNo(t.ticketNo)}
                className={`w-full flex flex-col text-left px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/40 transition-colors ${selectedTicketNo === t.ticketNo ? "bg-[#fdf2f4] border-l-2 border-l-[#8B1A2F]" : ""}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{t.patientName}</span>
                  <span className="text-[10px] font-mono text-[#8B1A2F]">{t.ticketNo}</span>
                </div>
                <span className="text-xs text-muted-foreground">{t.patientId} · {t.visitType}</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">{notes.filter((n) => n.ticketNo === t.ticketNo).length} note(s)</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right — EMR detail */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <FileText className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">Select a patient to view EMR</p>
            <p className="text-sm text-muted-foreground mt-2">Clinical notes and patient history will appear here.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-border/50 flex items-start justify-between">
              <div>
                <h2 className="font-bold text-foreground text-lg">{selected.patientName}</h2>
                <p className="text-xs text-muted-foreground">
                  {selected.patientId} · Age {selected.age ?? "—"} · {selected.gender ?? "—"} · {selected.visitType} · {selected.ticketNo}
                </p>
                {selected.vitals && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    BP {selected.vitals.bpSystolic}/{selected.vitals.bpDiastolic} mmHg · Temp {selected.vitals.temperature}°C · O₂ {selected.vitals.o2Saturation}%
                  </p>
                )}
              </div>
              <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />Add Note
              </Button>
            </div>

            {/* Add note inline form */}
            {addOpen && (
              <div className="px-6 py-4 bg-muted/20 border-b border-border/50 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {(["SOAP", "Progress", "Diagnosis", "Referral", "General"] as const).map((t) => (
                    <button key={t} onClick={() => setNoteType(t)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${noteType === t ? "bg-[#8B1A2F] border-[#8B1A2F] text-white" : "bg-white border-border text-muted-foreground"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} placeholder={`Write ${noteType} note...`}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setAddOpen(false); setContent(""); }}>Cancel</Button>
                  <Button size="sm" onClick={addNote} disabled={!content.trim()}>Save Note</Button>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Vitals summary card */}
              {selected.vitals && (
                <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
                  <p className="text-xs font-semibold text-purple-700 mb-2 uppercase tracking-wide">Nurse Vitals — {selected.vitals.recordedAt}</p>
                  <div className="grid grid-cols-4 gap-x-6 gap-y-1 text-xs">
                    <span><span className="text-muted-foreground">BP: </span><strong>{selected.vitals.bpSystolic}/{selected.vitals.bpDiastolic}</strong></span>
                    <span><span className="text-muted-foreground">Temp: </span><strong>{selected.vitals.temperature}°C</strong></span>
                    <span><span className="text-muted-foreground">Pulse: </span><strong>{selected.vitals.pulse} bpm</strong></span>
                    <span><span className="text-muted-foreground">O₂: </span><strong>{selected.vitals.o2Saturation}%</strong></span>
                    <span><span className="text-muted-foreground">Resp: </span><strong>{selected.vitals.respiration}/min</strong></span>
                    <span><span className="text-muted-foreground">Wt: </span><strong>{selected.vitals.weight} kg</strong></span>
                    <span><span className="text-muted-foreground">Ht: </span><strong>{selected.vitals.height} cm</strong></span>
                  </div>
                </div>
              )}

              {patientNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No clinical notes yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Add a note using the button above.</p>
                </div>
              ) : (
                patientNotes.map((n) => (
                  <div key={n.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[n.type]}`}>{n.type}</span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{n.createdAt} · {n.author}
                      </div>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">{n.content}</p>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
