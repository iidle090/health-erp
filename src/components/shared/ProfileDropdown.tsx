import React, { useState } from "react";
import { LogOut, User, Settings, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { UserProfileModal } from "@/components/shared/UserProfileModal";

const ROLE_AVATAR_STYLES: Record<string, string> = {
  admin:        "bg-[#fdf2f4] text-[#8B1A2F]",
  doctor:       "bg-amber-100 text-amber-800",
  nurse:        "bg-orange-100 text-orange-800",
  superadmin:   "bg-[#1a0a10] text-[#ebc325]",
  lab:          "bg-[#8B1A2F] text-white",
  pharmacy:     "bg-[#8B1A2F] text-white",
  accountant:   "bg-[#8B1A2F] text-white",
  receptionist: "bg-[#8B1A2F] text-white",
  radiology:    "bg-[#0f2d4a] text-white",
};

interface ProfileDropdownProps {
  /** Optional override for avatar classes (border, size etc). Defaults to h-9 w-9. */
  avatarCls?: string;
}

export function ProfileDropdown({ avatarCls = "h-9 w-9 border border-border/50" }: ProfileDropdownProps) {
  const { user, logout } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<"profile" | "preferences" | "security">("profile");

  const initials = (user?.name ?? "U").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  const avatarStyle = ROLE_AVATAR_STYLES[user?.role ?? "admin"];

  const open = (tab: "profile" | "preferences" | "security") => {
    setDefaultTab(tab);
    setModalOpen(true);
  };

  return (
    <>
      <UserProfileModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B1A2F]/30 ${avatarCls}`}>
            <Avatar className={avatarCls}>
              <AvatarFallback className={`text-sm font-bold ${avatarStyle}`}>{initials}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name ?? "User"}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email ?? ""}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => open("profile")} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => open("preferences")} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />Preferences
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => open("security")} className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />Change Password
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
