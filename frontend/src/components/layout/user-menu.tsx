"use client";

import { useQuery } from "@tanstack/react-query";

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
        <div className="h-8 w-8 bg-surface-200 animate-pulse border-2 border-black shrink-0" />
        <div className="flex-1">
          <div className="h-3 w-20 bg-surface-200 animate-pulse mb-1" />
          <div className="h-2 w-32 bg-surface-200 animate-pulse" />
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
    <div className="flex items-center gap-3 px-3 py-2 border-2 border-transparent hover:border-black hover:bg-surface-100 transition-colors cursor-pointer">
      {/* Avatar */}
      {user.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || user.email}
          className="h-8 w-8 object-cover border-2 border-black shrink-0"
        />
      ) : (
        <div className="h-8 w-8 border-2 border-black bg-accent-600 flex items-center justify-center text-white font-pixel text-[8px] shrink-0">
          {initials}
        </div>
      )}

      {/* User info */}
      <div className="flex-1 min-w-0 font-pixel">
        <div className="text-xs text-surface-900 truncate">
          {user.name || "Player"}
        </div>
      </div>

      {/* Dropdown indicator */}
      <span className="text-surface-400 shrink-0 rotate-90">
        <i className="hn hn-play-solid"></i>
      </span>
    </div>
  );

  return (
    <DropdownMenu trigger={trigger} align="right">
      <DropdownMenuItem
        onClick={handleProfile}
        icon={<i className="hn hn-cog text-base" />}
        className="px-2 py-1"
      >
        <div className="font-pixel text-[8px]"> Edit Profile</div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleLogout}
        icon={<i className="hn hn-logout text-base" />}
        variant="danger"
        className="px-2 py-1"
      >
        <div className="font-pixel text-[8px]"> Log out</div>
      </DropdownMenuItem>
    </DropdownMenu>
  );
}
