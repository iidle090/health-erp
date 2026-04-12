import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChangePassword } from "@/pages/ChangePassword";

interface PendingChange {
  email: string;
  role: UserRole;
  displayName: string;
  clinicId?: string | null;
}

export function RoleSelection() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
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
        setPendingChange({
          email: account.email,
          role: account.role as UserRole,
          displayName: account.displayName,
          clinicId: account.clinicId ?? null,
        });
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
          login(
            pendingChange.role,
            pendingChange.email,
            pendingChange.displayName,
            pendingChange.clinicId ?? null
          );
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf2f4] via-white to-[#fff8f0] flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        {/* Logo + branding */}
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Shaniid Health ERP" className="h-28 w-auto object-contain mb-4" />
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your portal</p>
        </div>

        {/* Login card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@clinic.com"
                required
                className="h-11"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  className="h-11 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <Button
              type="submit"
              className="w-full h-11 gap-2 bg-[#8B1A2F] hover:bg-[#6d1424] text-white"
              disabled={loading}
            >
              <LogIn className="h-4 w-4" />
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="rounded-xl bg-muted/40 border border-border/60 px-4 py-3 text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground/70">How to log in</p>
            <p>Enter the email and password provided by your administrator. If this is your first login you will be asked to set a new password.</p>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Shaniid Health ERP v2.0 — Secure Healthcare Management
        </p>
      </motion.div>
    </div>
  );
}
