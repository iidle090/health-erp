import React, { useState } from "react";
import { Globe, Shield, Database, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SuperSettings() {
  const [tab, setTab] = useState<"language" | "security" | "backup" | "notifications">("language");
  const [lang, setLang] = useState("English (US)");
  const [timezone, setTimezone] = useState("UTC-5 (Eastern)");
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [twoFA, setTwoFA] = useState(true);
  const [auditLog, setAuditLog] = useState(true);
  const [backupFreq, setBackupFreq] = useState("Daily");
  const [retention, setRetention] = useState("90");

  const tabs = [
    { key: "language" as const, label: "Language & Region", icon: Globe },
    { key: "security" as const, label: "Security", icon: Shield },
    { key: "backup" as const, label: "Backup", icon: Database },
    { key: "notifications" as const, label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Global configuration for all clinics and portals</p>
      </div>

      <div className="flex gap-5">
        <div className="w-56 flex-shrink-0 space-y-1">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors ${tab === t.key ? "bg-[#fdf2f4] text-[#8B1A2F]" : "text-muted-foreground hover:bg-muted/40"}`}>
              <t.icon className="h-4 w-4 flex-shrink-0" />{t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 rounded-xl border border-border bg-card shadow-sm p-6">
          {tab === "language" && (
            <div className="space-y-5 max-w-md">
              <h2 className="font-semibold text-foreground">Language & Region</h2>
              <div className="space-y-1.5"><Label>System Language</Label>
                <select value={lang} onChange={(e) => setLang(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {["English (US)","English (UK)","Spanish","French","Arabic","Portuguese"].map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Timezone</Label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {["UTC-8 (Pacific)","UTC-7 (Mountain)","UTC-6 (Central)","UTC-5 (Eastern)","UTC+0 (GMT)","UTC+1 (CET)"].map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Date Format</Label>
                <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {["MM/DD/YYYY","DD/MM/YYYY","YYYY-MM-DD"].map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <Button>Save Changes</Button>
            </div>
          )}
          {tab === "security" && (
            <div className="space-y-5 max-w-md">
              <h2 className="font-semibold text-foreground">Security Settings</h2>
              <div className="space-y-1.5"><Label>Session Timeout (minutes)</Label><Input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>Password Policy — Minimum Length</Label><Input type="number" defaultValue={8} /></div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div><p className="text-sm font-medium">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Require 2FA for all admin accounts</p></div>
                <button onClick={() => setTwoFA(!twoFA)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFA ? "bg-[#8B1A2F]" : "bg-gray-200"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFA ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div><p className="text-sm font-medium">Audit Logging</p><p className="text-xs text-muted-foreground">Log all user actions system-wide</p></div>
                <button onClick={() => setAuditLog(!auditLog)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${auditLog ? "bg-[#8B1A2F]" : "bg-gray-200"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${auditLog ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
              <Button>Save Security Settings</Button>
            </div>
          )}
          {tab === "backup" && (
            <div className="space-y-5 max-w-md">
              <h2 className="font-semibold text-foreground">Backup & Recovery</h2>
              <div className="rounded-xl border border-[#f0d0d6] bg-[#fdf2f4] p-4">
                <p className="text-sm font-medium text-[#8B1A2F]">Last Backup: Today at 03:00 AM</p>
                <p className="text-xs text-[#8B1A2F]/80 mt-1">All data successfully backed up. Size: 2.4 GB</p>
              </div>
              <div className="space-y-1.5"><Label>Backup Frequency</Label>
                <select value={backupFreq} onChange={(e) => setBackupFreq(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">
                  {["Hourly","Every 6 hours","Daily","Weekly"].map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>Retention Period (days)</Label><Input type="number" value={retention} onChange={(e) => setRetention(e.target.value)} /></div>
              <div className="flex gap-3">
                <Button>Save Settings</Button>
                <Button variant="outline">Run Backup Now</Button>
              </div>
            </div>
          )}
          {tab === "notifications" && (
            <div className="space-y-5 max-w-md">
              <h2 className="font-semibold text-foreground">Notification Settings</h2>
              {[
                { label: "System Alerts", desc: "Critical system errors and downtime alerts" },
                { label: "New Clinic Registration", desc: "Notify when a new clinic signs up" },
                { label: "User Activity Reports", desc: "Daily summary of user logins and actions" },
                { label: "Revenue Alerts", desc: "Alerts for unpaid invoices over 30 days" },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div><p className="text-sm font-medium text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#8B1A2F] transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                  </button>
                </div>
              ))}
              <Button>Save Preferences</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
