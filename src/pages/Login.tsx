import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const role = rawRole as UserRole;

  const [, navigate] = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState(DEFAULT_EMAILS[role]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ✅ SUPER ADMIN
    if (
      email.trim().toLowerCase() === "super@hospital.com" &&
      password === "SuperAdmin@2026"
    ) {
      login("superadmin", email, "Super Admin");
      return;
    }

    // ✅ DEMO USERS
    const users = [
      { email: "admin@hospital.com", password: "admin123", role: "admin" },
      { email: "doctor@hospital.com", password: "doctor123", role: "doctor" },
      { email: "nurse@hospital.com", password: "nurse123", role: "nurse" },
      { email: "lab@hospital.com", password: "lab123", role: "lab" },
      { email: "pharmacy@hospital.com", password: "pharmacy123", role: "pharmacy" },
      { email: "accountant@hospital.com", password: "account123", role: "accountant" },
      { email: "reception@hospital.com", password: "reception123", role: "receptionist" },
      { email: "radiology@hospital.com", password: "radio123", role: "radiology" },
    ];

    const user = users.find(
      (u) =>
        u.email === email.trim().toLowerCase() &&
        u.password === password
    );

    if (user) {
      login(user.role as UserRole, user.email, user.role);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <motion.div className="w-full max-w-md">
        <button onClick={() => navigate("/")} className="mb-4 flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="border rounded-xl p-6 shadow">
          <div className="text-center mb-6">
            <img src={logo} className="h-20 mx-auto mb-2" />
            <h2 className="text-xl font-bold">Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button className="w-full">Sign in</Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}