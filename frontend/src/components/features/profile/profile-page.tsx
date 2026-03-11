"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ProfileSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => authApi.me(),
  });

  // Profile form state
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: (data: { name?: string; avatar?: string }) =>
      authApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
      alert("Profile updated successfully!");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to update profile");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(data),
    onSuccess: () => {
      alert("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Failed to change password");
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, avatar });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters!");
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="min-h-screen bg-surface-50 px-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-pixel text-sm text-surface-900">Edit Profile</h1>
          <p className="font-pixel text-[8px] text-surface-600 mt-2">
            Manage your personal information and account security
          </p>
        </div>

        {/* Tabs */}
        <div className="nes-tabs mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`nes-tabs__tab${activeTab === "profile" ? " is-active" : ""}`}
          >
            <i className="hn hn-user text-base inline mr-2" />
            Personal Info
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`nes-tabs__tab${activeTab === "password" ? " is-active" : ""}`}
          >
            <i className="hn hn-lock text-base inline mr-2" />
            Change Password
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <motion.div
              key="profile-tab"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-surface-0 rounded-lg shadow-sm p-6"
            >
              <form onSubmit={handleUpdateProfile}>
                {/* Avatar Preview */}
                <div className="flex items-center gap-6 mb-6 border-b border-surface-100">
                  <div className="flex-shrink-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt="Avatar"
                        className="h-24 w-24 rounded-full object-cover border-4 border-surface-100"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-accent-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-surface-100">
                        {user?.name?.charAt(0).toUpperCase() ||
                          user?.email.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-pixel text-xs text-surface-900">
                      {user?.name || "User"}
                    </h3>
                    <p className="font-pixel text-xs text-surface-500 flex items-center gap-2 mt-1">
                      <i className="hn hn-envelope text-base" />
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 font-pixel">
                  <div>
                    <label className="block text-xs text-surface-700 mb-2">
                      Display name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="nes-input !text-xs w-full !px-2 !py-1 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div className="space-y-4 font-pixel">
                    <label className="block text-xs text-surface-700 mb-2">
                      URL Avatar
                    </label>
                    <input
                      type="url"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="nes-input !text-xs w-full !px-2 !py-1 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                      placeholder="https://example.com/avatar.jpg"
                    />
                    <p className="font-pixel text-[8px] text-surface-500 !mt-1">
                      Enter the URL of your avatar image
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-surface-100">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    size="sm"
                  >
                    {updateProfileMutation.isPending
                      ? "Saving..."
                      : "Save changes"}{" "}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.back()}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <motion.div
              key="password-tab"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="bg-surface-0 rounded-lg shadow-sm p-6"
            >
              <form onSubmit={handleChangePassword}>
                <div className="space-y-4 font-pixel">
                  <div>
                    <label className="block font-pixel text-[9px] text-surface-700 mb-2">
                      Current password
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="nes-input !text-xs w-full"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-pixel text-[9px] text-surface-700 mb-2">
                      New password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="nes-input !text-xs w-full"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                    <p className="font-pixel text-[8px] text-surface-500 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>

                  <div>
                    <label className="block font-pixel text-[9px] text-surface-700 mb-2">
                      Confirm new password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="nes-input !text-xs w-full"
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-surface-100">
                  <Button
                    type="submit"
                    disabled={changePasswordMutation.isPending}
                    size="sm"
                  >
                    {changePasswordMutation.isPending
                      ? "Saving..."
                      : "Change Password"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => router.push("/forgot-password")}
                    size="sm"
                  >
                    Forgot password?
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
