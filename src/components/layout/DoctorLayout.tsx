import React from "react";
import { DoctorSidebar } from "./DoctorSidebar";
import { DoctorHeader } from "./DoctorHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export function DoctorLayout({ children }: DoctorLayoutProps) {
  const [location] = useLocation();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <DoctorSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DoctorHeader />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-6 relative">
            <div className="mx-auto max-w-7xl h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
