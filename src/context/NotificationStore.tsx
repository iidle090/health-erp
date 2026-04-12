import React, { createContext, useContext, useState, useCallback } from "react";

export type PortalRole = "admin" | "doctor" | "nurse" | "superadmin" | "lab" | "pharmacy" | "accountant" | "receptionist" | "radiology";

export interface PortalNotification {
  id: string;
  from: PortalRole;
  to: PortalRole;
  type: "lab_order" | "lab_result" | "prescription" | "pharmacy_request" | "invoice" | "general" | "alert";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, unknown>;
}

const STORE_KEY = "health_erp_notifications_v3";

const INITIAL_NOTIFICATIONS: PortalNotification[] = [];

function loadNotifications(): PortalNotification[] {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (!stored) return INITIAL_NOTIFICATIONS;
    return JSON.parse(stored);
  } catch { return INITIAL_NOTIFICATIONS; }
}

function saveNotifications(n: PortalNotification[]) {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(n)); } catch {}
}

interface NotificationContextType {
  notifications: PortalNotification[];
  sendNotification: (n: Omit<PortalNotification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: (role: PortalRole) => void;
  getNotifications: (role: PortalRole) => PortalNotification[];
  getUnreadCount: (role: PortalRole) => number;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<PortalNotification[]>(() => loadNotifications());

  const sendNotification = useCallback((n: Omit<PortalNotification, "id" | "timestamp" | "read">) => {
    const newN: PortalNotification = { ...n, id: `n-${Date.now()}`, timestamp: new Date().toLocaleString("en-US"), read: false };
    setNotifications((prev) => { const next = [newN, ...prev]; saveNotifications(next); return next; });
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => { const next = prev.map((n) => n.id === id ? { ...n, read: true } : n); saveNotifications(next); return next; });
  }, []);

  const markAllRead = useCallback((role: PortalRole) => {
    setNotifications((prev) => { const next = prev.map((n) => n.to === role ? { ...n, read: true } : n); saveNotifications(next); return next; });
  }, []);

  const getNotifications = useCallback((role: PortalRole) =>
    notifications.filter((n) => n.to === role).sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [notifications]);

  const getUnreadCount = useCallback((role: PortalRole) =>
    notifications.filter((n) => n.to === role && !n.read).length,
    [notifications]);

  return (
    <NotificationContext.Provider value={{ notifications, sendNotification, markRead, markAllRead, getNotifications, getUnreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be within NotificationProvider");
  return ctx;
}
