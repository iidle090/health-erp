import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ROLE_COLORS: Record<string, string> = {
  admin:        "text-[#8B1A2F] bg-[#fdf2f4]",
  doctor:       "text-amber-700 bg-amber-50",
  nurse:        "text-orange-700 bg-orange-50",
  superadmin:   "text-[#ebc325] bg-[#1a0a10]",
  lab:          "text-blue-700 bg-blue-50",
  pharmacy:     "text-green-700 bg-green-50",
  accountant:   "text-purple-700 bg-purple-50",
  receptionist: "text-teal-700 bg-teal-50",
  radiology:    "text-sky-700 bg-sky-50",
};

interface ChangePasswordProps {
  email: string;
  role: string;
  displayName: string;
  onSuccess: () => void;
}

export function ChangePassword({ email, role, displayName, onSuccess }: ChangePasswordProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const roleCls = ROLE_COLORS[role] ?? "text-gray-700 bg-gray-50";

  const strength = (() => {
    if (newPassword.length === 0) return 0;
    let s = 0;
    if (newPassword.length >= 8) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthCls   = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-green-500"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Failed to set password. Please contact your administrator.");
        setLoading(false);
        return;
      }
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
    setTimeout(() => onSuccess(), 1200);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
          <div className="flex flex-col items-center mb-7">
            <img src={logo} alt="Shaniid Health ERP" className="h-20 w-auto object-contain mb-4" />
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 mb-4 text-sm font-medium ${roleCls}`}>
              <KeyRound className="h-3.5 w-3.5" />First-Time Setup
            </div>
            <h1 className="text-2xl font-bold text-foreground text-center">Create Your Password</h1>
            <p className="text-sm text-muted-foreground mt-1 text-center">
              Welcome, <span className="font-semibold text-foreground">{displayName}</span>!<br />
              Your account is ready. Please set a new password to continue.
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 mb-6 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-0.5">Security Notice</p>
              <p className="text-xs text-blue-600">Your temporary password was created by your administrator. You must create a new personal password before continuing. You'll use this password every time you log in.</p>
            </div>
          </div>

          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center py-6 gap-3">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-base font-bold text-foreground">Password set successfully!</p>
              <p className="text-sm text-muted-foreground">Logging you in…</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="new-pw">New Password</Label>
                <div className="relative">
                  <Input id="new-pw" type={showNew ? "text" : "password"} value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters" required className="h-11 pr-10"
                    autoFocus autoComplete="new-password" />
                  <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {newPassword.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1,2,3,4].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthCls : "bg-muted"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: <span className="font-semibold">{strengthLabel}</span>
                      {strength < 3 && <> · Add uppercase, numbers, or symbols</>}
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pw">Confirm New Password</Label>
                <div className="relative">
                  <Input id="confirm-pw" type={showConfirm ? "text" : "password"} value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your new password" required className="h-11 pr-10"
                    autoComplete="new-password" />
                  <button type="button" onClick={() => setShowConfirm(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
                {confirmPassword && newPassword === confirmPassword && newPassword.length >= 8 && (
                  <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Passwords match</p>
                )}
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</motion.p>
              )}

              <Button type="submit" className="w-full h-11 bg-[#ebc325] text-black hover:bg-[#d4ae1f] font-semibold" disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}>
                {loading ? "Setting password…" : "Set Password & Continue"}
              </Button>
            </form>
          )}

          <p className="text-xs text-center text-muted-foreground mt-5">
            Having trouble? Contact your system administrator at <span className="font-medium">admin@hospital.com</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
