import React, { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const logs = [
  { id: 1, timestamp: "2025-04-08 10:42", user: "Dr. Olivia Patel", role: "Doctor", clinic: "City General Hospital", action: "CREATED", resource: "Lab Order LO-005 for Robert Kim", ip: "192.168.1.42", severity: "info" },
  { id: 2, timestamp: "2025-04-08 10:30", user: "Lab Tech Johnson", role: "Lab", clinic: "City General Hospital", action: "UPDATED", resource: "Lab Order LO-001 status → In Progress", ip: "192.168.1.50", severity: "info" },
  { id: 3, timestamp: "2025-04-08 10:15", user: "PharmD Williams", role: "Pharmacy", clinic: "City General Hospital", action: "DISPENSED", resource: "Prescription RX-003 — Sarah Johnson", ip: "192.168.1.65", severity: "info" },
  { id: 4, timestamp: "2025-04-08 09:58", user: "Nurse Rebecca Mills", role: "Nurse", clinic: "City General Hospital", action: "UPDATED", resource: "Vitals for PT-10022 Michael Chen", ip: "192.168.1.30", severity: "info" },
  { id: 5, timestamp: "2025-04-08 09:30", user: "Admin User", role: "Admin", clinic: "City General Hospital", action: "CREATED", resource: "New patient Admission — Room 415", ip: "192.168.1.10", severity: "info" },
  { id: 6, timestamp: "2025-04-08 09:00", user: "Super Admin", role: "Super Admin", clinic: "System", action: "SUSPENDED", resource: "Clinic: Harbor Wellness Center", ip: "10.0.0.1", severity: "warning" },
  { id: 7, timestamp: "2025-04-08 08:45", user: "Accountant Chen", role: "Accountant", clinic: "City General Hospital", action: "EXPORTED", resource: "Revenue Report Q1 2025", ip: "192.168.1.80", severity: "info" },
  { id: 8, timestamp: "2025-04-08 08:30", user: "Unknown", role: "—", clinic: "Metro Health Center", action: "FAILED_LOGIN", resource: "Login attempt — admin@metrohealth.com", ip: "203.45.12.88", severity: "critical" },
  { id: 9, timestamp: "2025-04-08 08:15", user: "Super Admin", role: "Super Admin", clinic: "System", action: "CREATED", resource: "User: Dr. James Park @ Sunrise Medical", ip: "10.0.0.1", severity: "info" },
  { id: 10, timestamp: "2025-04-08 07:00", user: "Lab Tech Johnson", role: "Lab", clinic: "City General Hospital", action: "COMPLETED", resource: "Lab Order LO-004 — Sarah Johnson", ip: "192.168.1.50", severity: "info" },
  { id: 11, timestamp: "2025-04-07 16:30", user: "Dr. Olivia Patel", role: "Doctor", clinic: "City General Hospital", action: "DELETED", resource: "Draft prescription RX-007", ip: "192.168.1.42", severity: "warning" },
  { id: 12, timestamp: "2025-04-07 15:00", user: "PharmD Williams", role: "Pharmacy", clinic: "City General Hospital", action: "UPDATED", resource: "Inventory: Furosemide 40mg stock → 18", ip: "192.168.1.65", severity: "warning" },
];

const severityBadge: Record<string, string> = {
  info: "bg-amber-100 text-amber-700",
  warning: "bg-orange-100 text-orange-700",
  critical: "bg-[#fdf2f4] text-[#8B1A2F]",
};

export function SuperAuditLogs() {
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("All");

  const filtered = logs.filter((l) => {
    const ms = l.user.toLowerCase().includes(search.toLowerCase()) || l.action.toLowerCase().includes(search.toLowerCase()) || l.resource.toLowerCase().includes(search.toLowerCase());
    const mf = severity === "All" || l.severity === severity.toLowerCase();
    return ms && mf;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">System-wide activity trail — all user actions logged</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Events", value: logs.length, cls: "text-foreground" },
          { label: "Warnings", value: logs.filter((l) => l.severity === "warning").length, cls: "text-orange-700" },
          { label: "Critical", value: logs.filter((l) => l.severity === "critical").length, cls: "text-[#8B1A2F]" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            {["All","Info","Warning","Critical"].map((s) => (
              <button key={s} onClick={() => setSeverity(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${severity === s ? "bg-[#8B1A2F] text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>{s}</button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                {["Timestamp","User","Role","Clinic","Action","Resource","IP","Severity"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((l) => (
                <tr key={l.id} className={`hover:bg-muted/20 transition-colors ${l.severity === "critical" ? "bg-red-50/20" : ""}`}>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{l.timestamp}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{l.user}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.role}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[120px] truncate">{l.clinic}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-foreground">{l.action}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">{l.resource}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{l.ip}</td>
                  <td className="px-4 py-3"><span className={`font-medium px-2 py-0.5 rounded-full ${severityBadge[l.severity]}`}>{l.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">No logs match.</div>}
        </div>
      </div>
    </div>
  );
}
