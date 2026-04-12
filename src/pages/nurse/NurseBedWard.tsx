import React, { useState } from "react";
import { BedDouble, Plus, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrossPortal } from "@/context/CrossPortalStore";

const BED_KEY = "health_erp_beds_v2";

interface BedAssignment {
  bedId: string; ward: string; room: string;
  patientId: string; patientName: string; ticketNo: string;
  admittedAt: string; admissionType: "Admitted" | "Observation";
  notes: string;
}

function loadBeds(): BedAssignment[] {
  try { const s = localStorage.getItem(BED_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveBeds(b: BedAssignment[]) {
  try { localStorage.setItem(BED_KEY, JSON.stringify(b)); } catch {}
}

const WARDS = [
  { name: "General Ward", beds: ["GW-101", "GW-102", "GW-103", "GW-104", "GW-105", "GW-106", "GW-107", "GW-108"] },
  { name: "Monitoring Unit", beds: ["MU-201", "MU-202", "MU-203", "MU-204"] },
  { name: "ICU", beds: ["ICU-301", "ICU-302", "ICU-303"] },
  { name: "Pediatric Ward", beds: ["PW-401", "PW-402", "PW-403", "PW-404", "PW-405"] },
];

const ALL_BEDS = WARDS.flatMap((w) => w.beds.map((b) => ({ bedId: b, ward: w.name })));
const TOTAL_BEDS = ALL_BEDS.length;

const admissionColors: Record<string, string> = {
  Admitted: "border-[#8B1A2F] bg-[#fdf2f4] text-[#8B1A2F]",
  Observation: "border-amber-400 bg-amber-50 text-amber-700",
};

export function NurseBedWard() {
  const { tickets } = useCrossPortal();
  const [beds, setBeds] = useState<BedAssignment[]>(loadBeds);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<{ bedId: string; ward: string } | null>(null);
  const [selectedTicketNo, setSelectedTicketNo] = useState("");
  const [admissionType, setAdmissionType] = useState<"Admitted" | "Observation">("Admitted");
  const [notes, setNotes] = useState("");

  // Patients who are in the hospital (paid + not discharged)
  const activePatients = tickets.filter((t) => t.paid && !["Completed"].includes(t.status) || t.status === "Waiting Doctor" || t.status === "In Consultation");
  // Actually: show all paid patients so nurse can assign any paid patient to a bed
  const assignablePatients = tickets.filter((t) => t.paid);

  const occupiedBedIds = new Set(beds.map((b) => b.bedId));
  const occupiedCount = beds.length;
  const available = TOTAL_BEDS - occupiedCount;

  const openAssign = (bed: { bedId: string; ward: string }) => {
    setSelectedBed(bed);
    setSelectedTicketNo("");
    setAdmissionType("Admitted");
    setNotes("");
    setAssignOpen(true);
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed || !selectedTicketNo) return;
    const ticket = assignablePatients.find((t) => t.ticketNo === selectedTicketNo);
    if (!ticket) return;
    const assignment: BedAssignment = {
      bedId: selectedBed.bedId,
      ward: selectedBed.ward,
      room: selectedBed.bedId,
      patientId: ticket.patientId,
      patientName: ticket.patientName,
      ticketNo: ticket.ticketNo,
      admittedAt: new Date().toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
      admissionType,
      notes,
    };
    const updated = [...beds.filter((b) => b.bedId !== selectedBed.bedId), assignment];
    setBeds(updated);
    saveBeds(updated);
    setAssignOpen(false);
  };

  const discharge = (bedId: string) => {
    const updated = beds.filter((b) => b.bedId !== bedId);
    setBeds(updated);
    saveBeds(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bed & Ward Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Assign beds to patients and manage ward occupancy</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Beds", value: TOTAL_BEDS, sub: "Hospital capacity", color: "text-foreground" },
          { label: "Occupied", value: occupiedCount, sub: `${beds.filter((b) => b.admissionType === "Admitted").length} admitted`, color: "text-[#8B1A2F]" },
          { label: "Available", value: available, sub: "Open beds", color: "text-amber-700" },
          { label: "Observation", value: beds.filter((b) => b.admissionType === "Observation").length, sub: "Monitoring", color: "text-orange-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Ward sections */}
      {WARDS.map((ward) => {
        const wardBeds = ward.beds;
        const occupiedInWard = wardBeds.filter((b) => occupiedBedIds.has(b)).length;
        return (
          <div key={ward.name} className="rounded-xl border border-border bg-card shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BedDouble className="h-4 w-4 text-[#8B1A2F]" />
                <h2 className="font-semibold text-foreground">{ward.name}</h2>
                <span className="text-xs text-muted-foreground">({occupiedInWard}/{wardBeds.length} occupied)</span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {wardBeds.map((bedId) => {
                const assignment = beds.find((b) => b.bedId === bedId);
                return (
                  <div key={bedId} className={`rounded-xl border-2 p-3 transition-all ${assignment ? admissionColors[assignment.admissionType] : "border-border bg-muted/20 text-muted-foreground"}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold">{bedId}</span>
                      {assignment ? (
                        <button onClick={() => discharge(bedId)} title="Discharge / Free bed" className="opacity-60 hover:opacity-100"><X className="h-3.5 w-3.5" /></button>
                      ) : (
                        <button onClick={() => openAssign({ bedId, ward: ward.name })} title="Assign patient" className="opacity-60 hover:opacity-100"><Plus className="h-3.5 w-3.5" /></button>
                      )}
                    </div>
                    {assignment ? (
                      <div>
                        <p className="text-xs font-semibold truncate">{assignment.patientName}</p>
                        <p className="text-[10px] opacity-70">{assignment.patientId}</p>
                        <p className="text-[10px] opacity-70">{assignment.admissionType}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-2">
                        <User className="h-5 w-5 opacity-20 mb-1" />
                        <p className="text-[10px]">Available</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Current bed assignments table */}
      {beds.length > 0 && (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h2 className="font-semibold text-foreground">Current Admissions ({beds.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  {["Bed", "Ward", "Patient", "Type", "Admitted", "Notes", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {beds.map((b) => (
                  <tr key={b.bedId} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-mono text-xs font-bold text-[#8B1A2F]">{b.bedId}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{b.ward}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{b.patientName}</p>
                      <p className="text-xs font-mono text-muted-foreground">{b.patientId}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${b.admissionType === "Admitted" ? "bg-[#fdf2f4] text-[#8B1A2F]" : "bg-amber-100 text-amber-700"}`}>{b.admissionType}</span>
                    </td>
                    <td className="px-5 py-3 text-xs text-muted-foreground">{b.admittedAt}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground max-w-[160px] truncate">{b.notes || "—"}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => discharge(b.bedId)} className="text-xs text-red-600 hover:underline">Discharge</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign Patient to {selectedBed?.bedId}</DialogTitle></DialogHeader>
          {assignablePatients.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No patients registered yet. Patients will appear here after the receptionist registers and collects payment.
            </div>
          ) : (
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Patient *</label>
                <select value={selectedTicketNo} onChange={(e) => setSelectedTicketNo(e.target.value)} required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                  <option value="">— Select patient —</option>
                  {assignablePatients.map((t) => (
                    <option key={t.ticketNo} value={t.ticketNo}>{t.patientName} ({t.patientId}) · {t.ticketNo}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Admission Type</label>
                <div className="flex gap-3">
                  {(["Admitted", "Observation"] as const).map((type) => (
                    <button key={type} type="button" onClick={() => setAdmissionType(type)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all ${admissionType === type ? "bg-[#8B1A2F] border-[#8B1A2F] text-white" : "bg-white border-border text-muted-foreground"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold mb-1.5 block">Notes (optional)</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Special care instructions..."
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setAssignOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" className="flex-1">Assign Bed</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
