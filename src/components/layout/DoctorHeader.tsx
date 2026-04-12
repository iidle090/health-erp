import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { ProfileDropdown } from "@/components/shared/ProfileDropdown";

export function DoctorHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 flex-1">
        <form className="hidden sm:block flex-1 max-w-md relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients, records..."
            className="w-full bg-muted/50 shadow-none pl-9 rounded-full border-none focus-visible:ring-1"
          />
        </form>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell role="doctor" />
        <ProfileDropdown />
      </div>
    </header>
  );
}
