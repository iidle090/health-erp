import React, { useState } from "react";
import { Search, Phone, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { useAuth } from "@/context/AuthContext";

const statusColor: Record<string, string> = {
  Waiting: "bg-amber-100 text-amber-700",
  Called: "bg-blue-100 text-blue-700",
  "In Triage": "bg-orange-100 text-orange-700",
  "Vitals Done": "bg-purple-100 text-purple-700",
  "Waiting Doctor": "bg-[#fdf2f4] text-[#8B1A2F]",
  "In Consultation": "bg-[#fdf2f4] text-[#8B1A2F]",
  Completed: "bg-green-100 text-green-700",
};

const visitTypeColor: Record<string, string> = {
  Consultation: "bg-amber-50 text-amber-700",
  "Follow-up": "bg-blue-50 text-blue-700",
  Emergency: "bg-red-100 text-red-700",
};

const STATUS_FLOW: Record<string, string> = {
  Waiting: "Called",
  Called: "In Triage",
};

export function ReceptionistQueue() {
  const { tickets, updateTicket } = useCrossPortal();
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Clinic isolation: only show tickets from this clinic
  const clinicTickets = tickets.filter((t) =>
    user?.role === "superadmin" || (t.clinicId === user?.clinicId)
  );

  const filtered = clinicTickets.filter((t) => {
    const ms = t.patientName.toLowerCase().includes(search.toLowerCase()) || t.ticketNo.toLowerCase().includes(search.toLowerCase());
    const mf = filter === "All" || t.status === filter;
    return ms && mf;
  });

  const statusFilters = ["All", "Waiting", "Called", "In Triage", "Vitals Done", "Waiting Doctor", "In Consultation", "Completed"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Queue / Tickets</h1>
        <p className="text-sm text-muted-foreground mt-1">{clinicTickets.filter((t) => t.status !== "Completed").length} active · {clinicTickets.filter((t) => t.status === "Completed").length} completed</p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {["Waiting","Called","In Triage","Vitals Done","In Consultation","Completed"].map((s) => (
          <div key={s} className={`rounded-xl border p-3 text-center cursor-pointer transition-all ${filter === s ? "border-[#8B1A2F] bg-[#fdf2f4]" : "border-border bg-card hover:border-[#8B1A2F]/30"}`} onClick={() => setFilter(filter === s ? "All" : s)}>
            <p className="text-lg font-bold text-foreground">{clinicTickets.filter((t) => t.status === s).length}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{s}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search ticket or patient..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            {statusFilters.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Ticket","Patient","Visit Type","Doctor","Status","Paid","Time","Action"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((t) => (
                <tr key={t.ticketNo} className={`hover:bg-muted/20 transition-colors ${t.visitType === "Emergency" ? "bg-red-50/20" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {t.visitType === "Emergency" && <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                      <span className="font-mono text-xs font-bold text-[#8B1A2F]">{t.ticketNo}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{t.patientName}</p>
                    {t.phone && <p className="text-xs text-muted-foreground">{t.phone}</p>}
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2 py-0.5 rounded-full ${visitTypeColor[t.visitType]}`}>{t.visitType}</span></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{t.assignedDoctor}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[t.status]}`}>{t.status}</span></td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.paid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{t.paid ? "Paid" : "Unpaid"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{t.createdAt.split(" ")[1] ?? t.createdAt}</td>
                  <td className="px-4 py-3">
                    {STATUS_FLOW[t.status] && t.paid && (
                      <Button size="sm" className="h-7 text-xs gap-1" onClick={() => updateTicket(t.ticketNo, { status: STATUS_FLOW[t.status] as VisitTicket["status"], calledAt: new Date().toLocaleString("en-US") })}>
                        <Phone className="h-3 w-3" />{STATUS_FLOW[t.status] === "Called" ? "Call Patient" : "Send to Triage"}
                      </Button>
                    )}
                    {!t.paid && <span className="text-xs text-orange-600 italic">Awaiting payment</span>}
                    {t.status === "Completed" && <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No tickets found.</div>}
        </div>
      </div>
    </div>
  );
}

type VisitTicket = import("@/context/CrossPortalStore").VisitTicket;
