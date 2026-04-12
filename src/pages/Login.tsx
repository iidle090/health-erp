import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, ShieldCheck, Stethoscope, HeartPulse, Crown, FlaskConical, Pill, Wallet, ConciergeBell, ScanLine } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUPER_ADMIN_MASTER_PW } from "@/context/StaffAccountStore";
import { ChangePassword } from "@/pages/ChangePassword";

const roleConfig: Record<UserRole, { label: string; icon: React.ElementType; badgeCls: string; demoCls: string; demoTextCls: string }> = {
  admin:        { label: "Admin Login",        icon: ShieldCheck,   badgeCls: "bg-[#fdf2f4] text-[#8B1A2F]",      demoCls: "bg-[#fdf2f4]",    demoTextCls: "text-[#8B1A2F]" },
  doctor:       { label: "Doctor Login",       icon: Stethoscope,   badgeCls: "bg-amber-50 text-amber-700",        demoCls: "bg-amber-50",     demoTextCls: "text-amber-700" },
  nurse:        { label: "Nurse Login",        icon: HeartPulse,    badgeCls: "bg-orange-50 text-orange-700",      demoCls: "bg-orange-50",    demoTextCls: "text-orange-700" },
  superadmin:   { label: "Super Admin Login",  icon: Crown,         badgeCls: "bg-[#1a0a10] text-[#ebc325]",      demoCls: "bg-[#1a0a10]/10", demoTextCls: "text-[#1a0a10]" },
  lab:          { label: "Laboratory Login",   icon: FlaskConical,  badgeCls: "bg-blue-50 text-blue-700",          demoCls: "bg-blue-50",      demoTextCls: "text-blue-700" },
  pharmacy:     { label: "Pharmacy Login",     icon: Pill,          badgeCls: "bg-green-50 text-green-700",        demoCls: "bg-green-50",     demoTextCls: "text-green-700" },
  accountant:   { label: "Accountant Login",   icon: Wallet,        badgeCls: "bg-purple-50 text-purple-700",      demoCls: "bg-purple-50",    demoTextCls: "text-purple-700" },
  receptionist: { label: "Receptionist Login", icon: ConciergeBell, badgeCls: "bg-teal-50 text-teal-700",          demoCls: "bg-teal-50",      demoTextCls: "text-teal-700" },
  radiology:    { label: "Radiology Login",    icon: ScanLine,      badgeCls: "bg-sky-50 text-sky-700",            demoCls: "bg-sky-50",       demoTextCls: "text-sky-700" },
};

const DEFAULT_EMAILS: Record<UserRole, string> = {
  admin: "admin@hospital.com", doctor: "doctor@hospital.com", nurse: "nurse@hospital.com",
  superadmin: "super@hospital.com", lab: "lab@hospital.com", pharmacy: "pharmacy@hospital.com",
  accountant: "accountant@hospital.com", receptionist: "reception@hospital.com", radiology: "radiology@hospital.com",
};

interface PendingChange { email: string; role: UserRole; displayName: string; clinicId?: string | null; }

export function Login() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const rawRole = params.get("role") ?? "admin";
  const role = (rawRole in roleConfig ? rawRole : "admin") as UserRole;
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const config = roleConfig[role];

  const [email, setEmail] = useState(DEFAULT_EMAILS[role]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Invalid email or password. Please check your credentials.");
        setLoading(false);
        return;
      }

      const account = await res.json();

      if (account.mustChangePassword) {
        setPendingChange({ email: account.email, role: account.role as UserRole, displayName: account.displayName, clinicId: account.clinicId ?? null });
        setLoading(false);
        return;
      }

      login(account.role as UserRole, account.email, account.displayName, account.clinicId ?? null);
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  };

  if (pendingChange) {
    return (
      <ChangePassword
        email={pendingChange.email}
        role={pendingChange.role}
        displayName={pendingChange.displayName}
        onSuccess={() => {
          login(pendingChange.role, pendingChange.email, pendingChange.displayName, pendingChange.clinicId ?? null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />Back to role selection
        </button>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-8">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Shaniid Health ERP" className="h-28 w-auto object-contain mb-3" />
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 mb-4 ${config.badgeCls} text-sm font-medium`}>
              <config.icon className="h-3.5 w-3.5" />{config.label}
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">Welcome back to Shaniid Health ERP</p>
          </div>

          {role === "superadmin" && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mb-5 rounded-xl border border-[#ebc325]/40 bg-[#1a0a10]/5 px-4 py-3 flex gap-2 items-start">
              <Crown className="h-4 w-4 mt-0.5 text-[#ebc325] flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-[#1a0a10]">Fixed master credentials</p>
                <p className="text-xs text-[#1a0a10]/70 mt-1">These credentials work from any browser or device and never expire.</p>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@hospital.com" required className="h-11" autoComplete="username" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Your password"
                  required className="h-11 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</motion.p>
            )}
            <Button type="submit" className="w-full h-11 bg-[#ebc325] text-black hover:bg-[#d4ae1f]" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className={`mt-6 rounded-xl p-4 ${config.demoCls}`}>
            <p className={`text-xs font-medium ${config.demoTextCls} mb-1`}>
              {role === "superadmin" ? "Master credentials (fixed)" : "Access info"}
            </p>
            <p className={`text-xs ${config.demoTextCls}`}>Email: <span className="font-mono">{DEFAULT_EMAILS[role]}</span></p>
            {role === "superadmin"
              ? <p className={`text-xs ${config.demoTextCls}`}>Password: <span className="font-mono font-semibold">{SUPER_ADMIN_MASTER_PW}</span> — works from any browser</p>
              : role === "admin"
              ? <p className={`text-xs ${config.demoTextCls}`}>Password: created by Super Admin · must change on first login</p>
              : <p className={`text-xs ${config.demoTextCls}`}>Password: created by Admin · must change on first login</p>
            }
          </div>
        </div>
      </motion.div>
    </div>
  );
}
