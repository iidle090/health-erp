import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, User, Settings, Shield, Save, CheckCircle2, Bell, BellOff,
  Moon, Sun, Eye, EyeOff, KeyRound, Palette, Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const PREFS_KEY = "health_erp_user_prefs";

interface UserPrefs {
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundAlerts: boolean;
  compactMode: boolean;
  theme: "light" | "dark" | "system";
  language: "en" | "ar";
}

function loadPrefs(): UserPrefs {
  try {
    const s = localStorage.getItem(PREFS_KEY);
    if (s) return { ...defaultPrefs(), ...JSON.parse(s) };
  } catch {}
  return defaultPrefs();
}

function defaultPrefs(): UserPrefs {
  return { emailNotifications: true, pushNotifications: true, soundAlerts: false, compactMode: false, theme: "system", language: "en" };
}

function savePrefs(p: UserPrefs) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch {}
}

const ROLE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  admin:        { bg: "bg-[#fdf2f4]", text: "text-[#8B1A2F]",  label: "Administrator" },
  doctor:       { bg: "bg-amber-50",  text: "text-amber-700",   label: "Doctor" },
  nurse:        { bg: "bg-orange-50", text: "text-orange-700",  label: "Nurse" },
  superadmin:   { bg: "bg-[#1a0a10]", text: "text-[#ebc325]",   label: "Super Admin" },
  lab:          { bg: "bg-blue-50",   text: "text-blue-700",    label: "Lab Technician" },
  pharmacy:     { bg: "bg-green-50",  text: "text-green-700",   label: "Pharmacist" },
  accountant:   { bg: "bg-purple-50", text: "text-purple-700",  label: "Accountant" },
  receptionist: { bg: "bg-teal-50",   text: "text-teal-700",    label: "Receptionist" },
  radiology:    { bg: "bg-sky-50",    text: "text-sky-700",     label: "Radiologist" },
};

type Tab = "profile" | "preferences" | "security";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function UserProfileModal({ open, onClose }: Props) {
  const { user, updateProfile } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  // Profile tab state
  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [profileSaved, setProfileSaved] = useState(false);

  // Preferences state
  const [prefs, setPrefs] = useState<UserPrefs>(loadPrefs);

  // Security tab state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDisplayName(user?.name ?? "");
      setProfileSaved(false);
      setPwError("");
      setPwSaved(false);
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [open]); // deliberately only on open-change, not on user updates

  if (!open || !user) return null;

  const roleInfo = ROLE_COLORS[user.role] ?? ROLE_COLORS.admin;
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  // Password strength
  const pwStrength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();
  const pwStrengthLabel = ["", "Weak", "Fair", "Good", "Strong"][pwStrength];
  const pwStrengthCls   = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"][pwStrength];

  const handleSaveProfile = () => {
    if (!displayName.trim()) return;
    updateProfile(displayName.trim());
    setProfileSaved(true);
    setTimeout(() => { setProfileSaved(false); onClose(); }, 1500);
  };

  const handleSavePrefs = (updated: Partial<UserPrefs>) => {
    const next = { ...prefs, ...updated };
    setPrefs(next);
    savePrefs(next);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    if (newPassword.length < 8) { setPwError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setPwError("Passwords do not match."); return; }
    setPwLoading(true);
    await new Promise(r => setTimeout(r, 600));
    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, newPassword }),
      });
      if (!res.ok) { setPwError("Could not update password. Please try again."); setPwLoading(false); return; }
    } catch {
      setPwError("Connection error. Please try again."); setPwLoading(false); return;
    }
    setPwSaved(true);
    setPwLoading(false);
    setNewPassword(""); setConfirmPassword("");
    setTimeout(() => setPwSaved(false), 3000);
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile",     label: "Profile",      icon: User },
    { id: "preferences", label: "Preferences",  icon: Settings },
    { id: "security",    label: "Security",      icon: Shield },
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg rounded-2xl bg-background border border-border shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="font-semibold text-base">Profile & Preferences</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="flex items-center justify-center rounded-full h-8 w-8 bg-gray-100 border border-gray-300 text-gray-700 hover:bg-red-100 hover:border-red-400 hover:text-red-600 transition-colors font-bold"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Avatar + role strip */}
            <div className="flex items-center gap-4 px-6 py-4 bg-muted/30 border-b border-border">
              <div className={`h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${roleInfo.bg} ${roleInfo.text}`}>
                {initials}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <span className={`inline-flex items-center mt-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${roleInfo.bg} ${roleInfo.text}`}>{roleInfo.label}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 ${tab === t.id ? "border-[#8B1A2F] text-[#8B1A2F]" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <t.icon className="h-4 w-4" />{t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="px-6 py-5 overflow-y-auto max-h-[400px]">
              {/* ── Profile Tab ──────────────────────────────── */}
              {tab === "profile" && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="disp-name">Display Name</Label>
                    <Input id="disp-name" value={displayName} onChange={e => setDisplayName(e.target.value)}
                      placeholder="Your full name" className="h-10" />
                    <p className="text-xs text-muted-foreground">This name appears across all dashboards and reports.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email Address</Label>
                    <Input value={user.email} disabled className="h-10 bg-muted text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed — contact your administrator.</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Input value={roleInfo.label} disabled className="h-10 bg-muted text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    {profileSaved ? (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 text-sm text-green-600">
                        <CheckCircle2 className="h-4 w-4" />Saved!
                      </motion.span>
                    ) : <span />}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile} disabled={!displayName.trim() || displayName.trim() === user.name} className="bg-[#8B1A2F] text-white hover:bg-[#6d1524]">
                        <Save className="h-4 w-4 mr-1.5" />Save Profile
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Preferences Tab ──────────────────────────── */}
              {tab === "preferences" && (
                <div className="space-y-5">
                  {/* Notifications */}
                  <div>
                    <p className="text-sm font-semibold mb-3">Notifications</p>
                    <div className="space-y-3">
                      {([ ["emailNotifications", "Email Notifications", "Receive important updates by email", Bell],
                          ["pushNotifications",  "Push Notifications",  "In-app alerts for new tasks and results", Bell],
                          ["soundAlerts",        "Sound Alerts",        "Play a sound for urgent notifications", Bell],
                      ] as [keyof UserPrefs, string, string, React.ElementType][]).map(([key, label, desc, Icon]) => (
                        <div key={key} className="flex items-center justify-between rounded-xl border border-border p-3">
                          <div className="flex items-center gap-3">
                            {prefs[key]
                              ? <Bell className="h-4 w-4 text-[#8B1A2F]" />
                              : <BellOff className="h-4 w-4 text-muted-foreground" />
                            }
                            <div>
                              <p className="text-sm font-medium">{label}</p>
                              <p className="text-xs text-muted-foreground">{desc}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSavePrefs({ [key]: !prefs[key] } as Partial<UserPrefs>)}
                            className={`relative h-6 w-11 rounded-full transition-colors ${prefs[key] ? "bg-[#8B1A2F]" : "bg-muted-foreground/30"}`}
                          >
                            <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${prefs[key] ? "translate-x-6" : "translate-x-1"}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Display */}
                  <div>
                    <p className="text-sm font-semibold mb-3">Display</p>
                    <div className="space-y-3">
                      {/* Theme */}
                      <div className="rounded-xl border border-border p-3">
                        <p className="text-sm font-medium mb-2 flex items-center gap-2"><Palette className="h-4 w-4 text-muted-foreground" />Theme</p>
                        <div className="flex gap-2">
                          {(["light", "system", "dark"] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => handleSavePrefs({ theme: t })}
                              className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-colors capitalize ${prefs.theme === t ? "border-[#8B1A2F] bg-[#fdf2f4] text-[#8B1A2F]" : "border-border text-muted-foreground hover:border-foreground/30"}`}
                            >
                              {t === "light" && <Sun className="h-3.5 w-3.5" />}
                              {t === "system" && <Monitor className="h-3.5 w-3.5" />}
                              {t === "dark" && <Moon className="h-3.5 w-3.5" />}
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Compact mode */}
                      <div className="flex items-center justify-between rounded-xl border border-border p-3">
                        <div>
                          <p className="text-sm font-medium">Compact Mode</p>
                          <p className="text-xs text-muted-foreground">Reduces spacing for more content on screen</p>
                        </div>
                        <button
                          onClick={() => handleSavePrefs({ compactMode: !prefs.compactMode })}
                          className={`relative h-6 w-11 rounded-full transition-colors ${prefs.compactMode ? "bg-[#8B1A2F]" : "bg-muted-foreground/30"}`}
                        >
                          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${prefs.compactMode ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Security Tab ─────────────────────────────── */}
              {tab === "security" && (
                <div className="space-y-5">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-3">
                    <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-700">Change Your Password</p>
                      <p className="text-xs text-blue-600 mt-0.5">Choose a strong password with at least 8 characters, including numbers and symbols.</p>
                    </div>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="new-pw">New Password</Label>
                      <div className="relative">
                        <Input id="new-pw" type={showNew ? "text" : "password"} value={newPassword}
                          onChange={e => setNewPassword(e.target.value)} placeholder="Min. 8 characters" className="h-10 pr-10" />
                        <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {newPassword && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= pwStrength ? pwStrengthCls : "bg-muted"}`} />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{pwStrengthLabel}</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="conf-pw">Confirm Password</Label>
                      <div className="relative">
                        <Input id="conf-pw" type={showConfirm ? "text" : "password"} value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="h-10 pr-10" />
                        <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {pwError && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{pwError}</motion.p>
                    )}
                    {pwSaved && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg px-3 py-2">
                        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />Password updated successfully!
                      </motion.div>
                    )}
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={pwLoading || !newPassword || !confirmPassword} className="flex-1 bg-[#8B1A2F] text-white hover:bg-[#6d1524]">
                        <KeyRound className="h-4 w-4 mr-1.5" />{pwLoading ? "Updating…" : "Update Password"}
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
