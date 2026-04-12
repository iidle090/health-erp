import React, { useState } from "react";
import { Plus, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCrossPortal } from "@/context/CrossPortalStore";

const APPT_KEY = "health_erp_appointments_v2";

interface Appointment {
  id: string; patientId: string; patientName: string; ticketNo: string;
  date: string; time: string; type: string; status: "Scheduled" | "Completed" | "Cancelled";
  notes: string;
}

function loadAppts(): Appointment[] {
  try { const s = localStorage.getItem(APPT_KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function saveAppts(a: Appointment[]) {
  try { localStorage.setItem(APPT_KEY, JSON.stringify(a)); } catch {}
}

const statusConfig: Record<string, string> = {
  Scheduled: "bg-amber-100 text-amber-700",
  Completed: "bg-[#fdf2f4] text-[#8B1A2F]",
  Cancelled: "bg-gray-100 text-gray-500",
};

const APPT_TYPES = ["Follow-up", "Consultation", "Lab Review", "Routine Checkup", "Emergency Consult", "Procedure", "Discharge Planning"];

export function DoctorAppointments() {
  const { tickets } = useCrossPortal();
  const [appointments, setAppointments] = useState<Appointment[]>(loadAppts);
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState(false);
  const [selectedTicketNo, setSelectedTicketNo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [type, setType] = useState("Follow-up");
  const [notes, setNotes] = useState("");

  const myPatients = tickets.filter((t) => ["Waiting Doctor", "In Consultation", "Completed"].includes(t.status));

  // Also derive "appointments" from existing tickets (each completed or in-consultation ticket = appointment)
  const ticketAppts: Appointment[] = tickets
    .filter((t) => ["In Consultation", "Completed", "Waiting Doctor"].includes(t.status))
    .map((t) => ({
      id: `APPT-${t.ticketNo}`,
      patientId: t.patientId,
      patientName: t.patientName,
      ticketNo: t.ticketNo,
      date: t.createdAt.split(" ")[0] || new Date().toISOString().split("T")[0],
      time: t.createdAt.split(" ")[1] || "—",
      type: t.visitType,
      status: t.status === "Completed" ? "Completed" : "Scheduled",
      notes: t.notes || "",
    }));

  const allAppts = [...ticketAppts, ...appointments];
  const filtered = allAppts.filter((a) => filter === "All" || a.status === filter);
  const counts = {
    All: allAppts.length,
    Scheduled: allAppts.filter((a) => a.status === "Scheduled").length,
    Completed: allAppts.filter((a) => a.status === "Completed").length,
    Cancelled: allAppts.filter((a) => a.status === "Cancelled").length,
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket = myPatients.find((t) => t.ticketNo === selectedTicketNo);
    if (!ticket) return;
    const appt: Appointment = {
      id: `APPT-${Date.now()}`,
      patientId: ticket.patientId,
      patientName: ticket.patientName,
      ticketNo: ticket.ticketNo,
      date, time, type,
      status: "Scheduled",
      notes,
    };
    const updated = [appt, ...appointments];
    setAppointments(updated);
    saveAppts(updated);
    setOpen(false);
    setSelectedTicketNo(""); setDate(new Date().toISOString().split("T")[0]); setTime("09:00"); setType("Follow-up"); setNotes("");
  };

  const updateStatus = (id: string, status: Appointment["status"]) => {
    const updated = appointments.map((a) => a.id === id ? { ...a, status } : a);
    setAppointments(updated);
    saveAppts(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Appointments</h1>
          <p className="text-sm text-muted-foreground mt-1">Your scheduled patient appointments</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-2" disabled={myPatients.length === 0}>
          <Plus className="h-4 w-4" />Schedule Appointment
        </Button>
      </div>

      {myPatients.length === 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          No patients in your queue yet. Appointments can be scheduled once patients arrive from nurse triage.
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["All", "Scheduled", "Completed", "Cancelled"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl border p-4 text-left transition-all ${filter === s ? "border-[#8B1A2F] bg-[#fdf2f4] shadow-sm" : "border-border bg-card hover:bg-muted/30"}`}>
            <p className="text-xs text-muted-foreground">{s === "All" ? "Total" : s}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{counts[s]}</p>
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Calendar className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-base font-semibold text-muted-foreground">No appointments yet</p>
            <p className="text-sm text-muted-foreground mt-2">Schedule appointments for your patients using the button above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/20">
                  {["Patient", "Date", "Time", "Type", "Notes", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{a.patientName}</p>
                      <p className="text-xs font-mono text-muted-foreground">{a.patientId}</p>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />{a.date}
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{a.time}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-foreground">{a.type}</td>
                    <td className="px-5 py-3 text-xs text-muted-foreground max-w-[180px] truncate">{a.notes || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusConfig[a.status]}`}>{a.status}</span>
                    </td>
                    <td className="px-5 py-3">
                      {appointments.some((ap) => ap.id === a.id) && a.status === "Scheduled" && (
                        <div className="flex gap-1">
                          <button onClick={() => updateStatus(a.id, "Completed")} className="text-xs text-green-700 hover:underline">Done</button>
                          <span className="text-muted-foreground">·</span>
                          <button onClick={() => updateStatus(a.id, "Cancelled")} className="text-xs text-red-600 hover:underline">Cancel</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Schedule Appointment</DialogTitle></DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Patient *</Label>
              <select value={selectedTicketNo} onChange={(e) => setSelectedTicketNo(e.target.value)} required className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="">— Select patient —</option>
                {myPatients.map((t) => <option key={t.ticketNo} value={t.ticketNo}>{t.patientName} ({t.patientId})</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Date *</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <Label className="text-sm font-semibold mb-1.5 block">Time *</Label>
                <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Type</Label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm">
                {APPT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-sm font-semibold mb-1.5 block">Notes (optional)</Label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Purpose of appointment..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
              <Button type="submit" className="flex-1">Schedule</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
