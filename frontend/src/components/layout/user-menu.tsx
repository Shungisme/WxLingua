"use client";

import { useQuery } from "@tanstack/react-query";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => authApi.me(),
    retry: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const handleProfile = () => {
    router.push("/profile");
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 px-3 py-2">
        <div className="h-8 w-8 rounded-full bg-surface-200 animate-pulse" />
        <div className="flex-1">
          <div className="h-3 w-20 bg-surface-200 rounded animate-pulse mb-1" />
          <div className="h-2 w-32 bg-surface-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email[0].toUpperCase();

  const trigger = (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-50 transition-colors">
      {/* Avatar */}
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || user.email}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-accent-600 flex items-center justify-center text-white text-xs font-medium">
          {initials}
        </div>
      )}

      {/* User info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-900 truncate">
          {user.name || "User"}
        </p>
        <p className="text-xs text-surface-500 truncate">{user.email}</p>
      </div>

      {/* Dropdown indicator */}
      <ChevronDown className="h-4 w-4 text-surface-400 shrink-0" />
    </div>
  );

  return (
    <DropdownMenu trigger={trigger} align="right">
      <DropdownMenuItem
        onClick={handleProfile}
        icon={<Settings className="h-4 w-4" />}
      >
        Edit Profile
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleLogout}
        icon={<LogOut className="h-4 w-4" />}
        variant="danger"
      >
        Log out
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
