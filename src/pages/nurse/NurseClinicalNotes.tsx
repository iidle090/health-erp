import React, { useState } from "react";
import { Plus, FileText, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCrossPortal } from "@/context/CrossPortalStore";

const NOTES_KEY = "health_erp_nurse_notes_v2";

interface NurseNote {
  id: string; ticketNo: string; patientId: string; patientName: string;
  type: "SOAP" | "Intake/Output" | "Pain Assessment" | "Wound Care" | "General";
  content: string; time: string; nurse: string;
}

function loadNotes(): NurseNote[] {
  try { const s = localStorage.getItem(NOTES_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveNotes(n: NurseNote[]) {
  try { localStorage.setItem(NOTES_KEY, JSON.stringify(n)); } catch {}
}

const typeColors: Record<string, string> = {
  SOAP: "bg-[#fdf2f4] text-[#8B1A2F]",
  "Intake/Output": "bg-amber-100 text-amber-700",
  "Pain Assessment": "bg-orange-100 text-orange-700",
  "Wound Care": "bg-amber-50 text-amber-800",
  General: "bg-gray-100 text-gray-700",
};

export function NurseClinicalNotes() {
  const { tickets } = useCrossPortal();
  const [notes, setNotes] = useState<NurseNote[]>(loadNotes);
  const [selectedTicketNo, setSelectedTicketNo] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [noteType, setNoteType] = useState<NurseNote["type"]>("General");
  const [content, setContent] = useState("");

  // Nurse sees all paid patients
  const patients = tickets.filter((t) => t.paid);
  const selected = patients.find((t) => t.ticketNo === selectedTicketNo);

  const handleAdd = () => {
    if (!content.trim() || !selectedTicketNo || !selected) return;
    const now = new Date();
    const note: NurseNote = {
      id: `NN-${Date.now()}`,
      ticketNo: selectedTicketNo,
      patientId: selected.patientId,
      patientName: selected.patientName,
      type: noteType,
      content: content.trim(),
      time: now.toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      nurse: "Rebecca Mills, RN",
    };
    const updated = [note, ...notes];
    setNotes(updated);
    saveNotes(updated);
    setContent("");
    setAddOpen(false);
  };

  const patientNotes = notes.filter((n) => n.ticketNo === selectedTicketNo);

  return (
    <div className="flex items-start gap-5 h-[calc(100vh-8rem)]">
      {/* Left panel — patient list */}
      <div className="w-64 flex-shrink-0 rounded-xl border border-border bg-card shadow-sm overflow-y-auto h-full">
        <div className="px-4 py-3 border-b border-border/50">
          <h2 className="font-semibold text-foreground text-sm">Patients</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Select to write clinical notes</p>
        </div>
        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <FileText className="h-8 w-8 text-muted-foreground/20 mb-2" />
            <p className="text-xs text-muted-foreground">No patients yet</p>
            <p className="text-[10px] text-muted-foreground mt-1">Registered and paid patients appear here.</p>
          </div>
        ) : (
          patients.map((t) => {
            const noteCount = notes.filter((n) => n.ticketNo === t.ticketNo).length;
            return (
              <button key={t.ticketNo} onClick={() => { setSelectedTicketNo(t.ticketNo); setAddOpen(false); }}
                className={`w-full flex flex-col text-left px-4 py-3 border-b border-border/30 last:border-0 hover:bg-muted/40 transition-colors ${selectedTicketNo === t.ticketNo ? "bg-[#fdf2f4] border-l-2 border-l-[#8B1A2F]" : ""}`}>
                <span className="text-sm font-medium text-foreground">{t.patientName}</span>
                <span className="text-xs text-muted-foreground">{t.patientId}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-muted-foreground">{t.status}</span>
                  {noteCount > 0 && <span className="text-[10px] text-[#8B1A2F] font-medium">{noteCount} note{noteCount > 1 ? "s" : ""}</span>}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Right panel — notes */}
      <div className="flex-1 h-full rounded-xl border border-border bg-card shadow-sm flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-6">
            <FileText className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">Select a patient</p>
            <p className="text-sm text-muted-foreground mt-2">Clinical notes for the selected patient will appear here.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
              <div>
                <h2 className="font-bold text-foreground">{selected.patientName}</h2>
                <p className="text-xs text-muted-foreground">{selected.patientId} · {selected.ticketNo} · {selected.status}</p>
              </div>
              <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1.5">
                <Plus className="h-3.5 w-3.5" />Add Note
              </Button>
            </div>

            {/* Add note form */}
            {addOpen && (
              <div className="px-6 py-4 bg-muted/20 border-b border-border/50 space-y-3">
                <div className="flex gap-2 flex-wrap">
                  {(["General", "SOAP", "Intake/Output", "Pain Assessment", "Wound Care"] as const).map((t) => (
                    <button key={t} onClick={() => setNoteType(t)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${noteType === t ? "bg-[#8B1A2F] border-[#8B1A2F] text-white" : "bg-white border-border text-muted-foreground"}`}>
                      {t}
                    </button>
                  ))}
                </div>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={3} autoFocus
                  placeholder={`Write ${noteType} note for ${selected.patientName}...`}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => { setAddOpen(false); setContent(""); }}>Cancel</Button>
                  <Button size="sm" onClick={handleAdd} disabled={!content.trim()}>Save Note</Button>
                </div>
              </div>
            )}

            {/* Notes list */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {patientNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground/20 mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">No notes yet for {selected.patientName}</p>
                  <p className="text-xs text-muted-foreground mt-1">Use the button above to add the first clinical note.</p>
                </div>
              ) : (
                patientNotes.map((n) => (
                  <div key={n.id} className="rounded-xl border border-border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[n.type]}`}>{n.type}</span>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />{n.time} · {n.nurse}
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
