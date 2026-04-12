import React, { useState } from "react";
import { Bell, CheckCheck, FlaskConical, Pill, FileText, AlertTriangle, DollarSign, Info } from "lucide-react";
import { useNotifications, PortalRole, PortalNotification } from "@/context/NotificationStore";
import { Button } from "@/components/ui/button";

const typeIcon: Record<PortalNotification["type"], React.ElementType> = {
  lab_order: FlaskConical, lab_result: FlaskConical, prescription: Pill,
  pharmacy_request: Pill, invoice: DollarSign, general: Info, alert: AlertTriangle,
};

const typeBg: Record<PortalNotification["type"], string> = {
  lab_order: "bg-[#fdf2f4]", lab_result: "bg-[#fdf2f4]", prescription: "bg-amber-50",
  pharmacy_request: "bg-orange-50", invoice: "bg-amber-50", general: "bg-gray-100", alert: "bg-red-50",
};

const typeColor: Record<PortalNotification["type"], string> = {
  lab_order: "text-[#8B1A2F]", lab_result: "text-[#8B1A2F]", prescription: "text-amber-700",
  pharmacy_request: "text-orange-700", invoice: "text-amber-700", general: "text-gray-600", alert: "text-red-600",
};

export function NotificationBell({ role }: { role: PortalRole }) {
  const { getNotifications, getUnreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const notifications = getNotifications(role);
  const unreadCount = getUnreadCount(role);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative text-muted-foreground hover:text-foreground rounded-full">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B1A2F] text-[10px] font-bold text-white border-2 border-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-96 z-50 rounded-xl border border-border bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
              <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={() => { markAllRead(role); }} className="flex items-center gap-1 text-xs text-[#8B1A2F] hover:underline">
                  <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</div>
              ) : (
                notifications.slice(0, 10).map((n) => {
                  const Icon = typeIcon[n.type];
                  return (
                    <div key={n.id} onClick={() => markRead(n.id)} className={`flex items-start gap-3 px-4 py-3 hover:bg-muted/20 cursor-pointer transition-colors ${!n.read ? "bg-amber-50/30" : ""}`}>
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${typeBg[n.type]}`}>
                        <Icon className={`h-4 w-4 ${typeColor[n.type]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs font-semibold ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                          {!n.read && <span className="h-2 w-2 rounded-full bg-[#8B1A2F] flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{n.timestamp}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
