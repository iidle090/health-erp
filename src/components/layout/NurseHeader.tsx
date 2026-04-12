import React from "react";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";

export function NurseHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-medium text-amber-700">Day Shift — Active</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell role="nurse" />
        <ProfileDropdown />
      </div>
    </header>
  );
}
