import React, { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, type UserRole } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Login() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const role = (params.get("role") ?? "admin") as UserRole;

  const [, navigate] = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("demo@hospital.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 THIS IS THE FIX (NO BACKEND AT ALL)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // FORCE LOGIN (no validation, no API)
    login(role, email, "Demo User", null);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <motion.div className="w-full max-w-md">
        
        <button onClick={() => navigate("/")} className="mb-6 flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="rounded-2xl border bg-card shadow-sm p-8">

          <div className="flex flex-col items-center mb-8">
            <img src={logo} className="h-24 mb-3" />
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
              Sign in
            </Button>

          </form>

        </div>
      </motion.div>
    </div>
  );
}