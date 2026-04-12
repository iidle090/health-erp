import React from "react";
import { AlertTriangle, AlertCircle, Clock } from "lucide-react";
import { useCrossPortal } from "@/context/CrossPortalStore";
import { Button } from "@/components/ui/button";

function getDaysUntilExpiry(expiry: string) {
  const exp = new Date(expiry);
  return Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function PharmacyExpiryAlerts() {
  const { inventory } = useCrossPortal();

  const expired = inventory.filter((m) => getDaysUntilExpiry(m.expiry) < 0);
  const critical = inventory.filter((m) => { const d = getDaysUntilExpiry(m.expiry); return d >= 0 && d <= 30; });
  const warning = inventory.filter((m) => { const d = getDaysUntilExpiry(m.expiry); return d > 30 && d <= 90; });
  const ok = inventory.filter((m) => getDaysUntilExpiry(m.expiry) > 90);

  const groups = [
    { title: "Expired", items: expired, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-700" },
    { title: "Expiring within 30 days — Critical", items: critical, icon: AlertTriangle, color: "text-[#8B1A2F]", bg: "bg-[#fdf2f4]", border: "border-[#f0d0d6]", badge: "bg-[#fdf2f4] text-[#8B1A2F]" },
    { title: "Expiring within 90 days — Warning", items: warning, icon: Clock, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-700" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Expiry Alerts</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor medicines nearing or past expiry date</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Expired", count: expired.length, cls: "text-red-600" },
          { label: "Critical (≤30 days)", count: critical.length, cls: "text-[#8B1A2F]" },
          { label: "Warning (≤90 days)", count: warning.length, cls: "text-amber-700" },
          { label: "OK (>90 days)", count: ok.length, cls: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 shadow-sm text-center">
            <p className={`text-2xl font-bold ${s.cls}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {groups.map((g) => g.items.length > 0 && (
        <div key={g.title} className={`rounded-xl border ${g.border} ${g.bg} shadow-sm overflow-hidden`}>
          <div className="flex items-center gap-2 px-5 py-4 border-b border-current/10">
            <g.icon className={`h-4 w-4 ${g.color}`} />
            <h2 className={`font-semibold ${g.color}`}>{g.title} ({g.items.length})</h2>
          </div>
          <div className="divide-y divide-current/10">
            {g.items.map((m) => {
              const days = getDaysUntilExpiry(m.expiry);
              return (
                <div key={m.id} className="flex items-center justify-between px-5 py-3 bg-white/60">
                  <div>
                    <p className="font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.category} · {m.stock} {m.unit} in stock · Supplier: {m.supplier}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-mono text-sm font-bold text-foreground">{m.expiry}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${g.badge}`}>
                      {days < 0 ? `Expired ${Math.abs(days)}d ago` : days === 0 ? "Expires today" : `${days} days left`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {expired.length === 0 && critical.length === 0 && warning.length === 0 && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground text-sm">All medicines are within safe expiry range. No alerts at this time.</p>
        </div>
      )}
    </div>
  );
}
