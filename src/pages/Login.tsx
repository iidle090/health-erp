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
  admin: "admin@hospital.com",
  doctor: "doctor@hospital.com",
  nurse: "nurse@hospital.com",
  superadmin: "super@hospital.com",
  lab: "lab@hospital.com",
  pharmacy: "pharmacy@hospital.com",
  accountant: "accountant@hospital.com",
  receptionist: "reception@hospital.com",
  radiology: "radiology@hospital.com",
};

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
  const [loading, setLoading] = useState(false);

  // ✅ FIXED LOGIN (NO BACKEND)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // always login → opens correct dashboard
    login(role, email, "Demo User", null);

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div className="w-full max-w-md">
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" />Back
        </button>

        <div className="rounded-2xl border bg-card shadow-sm p-8">

          <div className="flex flex-col items-center mb-8">
            <img src={logo} className="h-24 mb-3" />
            <div className={`px-3 py-1 rounded-full text-sm ${config.badgeCls}`}>
              {config.label}
            </div>
            <h1 className="text-2xl font-bold mt-3">Sign in</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <Label>Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button className="w-full" type="submit">
              {loading ? "Signing in..." : "Sign in"}
            </Button>

          </form>

        </div>
      </motion.div>
    </div>
  );
}