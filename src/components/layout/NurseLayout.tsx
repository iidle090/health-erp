import React from "react";
import { NurseSidebar } from "./NurseSidebar";
import { NurseHeader } from "./NurseHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export function NurseLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <NurseSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <NurseHeader />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
            <div className="mx-auto max-w-7xl">
              <AnimatePresence mode="wait">
                <motion.div key={location} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
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
