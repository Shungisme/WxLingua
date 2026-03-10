"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { User2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

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
      alert("Mật khẩu mới không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-accent-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900">
            Chỉnh sửa hồ sơ
          </h1>
          <p className="text-surface-600 mt-2">
            Quản lý thông tin cá nhân và bảo mật tài khoản
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-surface-200 mb-6">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
              activeTab === "profile"
                ? "border-accent-600 text-accent-600"
                : "border-transparent text-surface-500 hover:text-surface-800"
            }`}
          >
            <User2 className="inline h-4 w-4 mr-2" />
            Thông tin cá nhân
          </button>
          <button
            onClick={() => setActiveTab("password")}
            className={`pb-3 px-4 font-medium transition-colors border-b-2 ${
              activeTab === "password"
                ? "border-accent-600 text-accent-600"
                : "border-transparent text-surface-500 hover:text-surface-800"
            }`}
          >
            <Lock className="inline h-4 w-4 mr-2" />
            Đổi mật khẩu
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-surface-0 rounded-lg shadow-sm p-6">
            <form onSubmit={handleUpdateProfile}>
              {/* Avatar Preview */}
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-surface-100">
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
                  <h3 className="text-lg font-semibold text-surface-900">
                    {user?.name || "User"}
                  </h3>
                  <p className="text-sm text-surface-500 flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Tên hiển thị
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                    placeholder="Nhập tên của bạn"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    URL Avatar
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  <p className="text-xs text-surface-500 mt-1">
                    Nhập URL hình ảnh avatar của bạn
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-surface-100">
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateProfileMutation.isPending
                    ? "Đang lưu..."
                    : "Lưu thay đổi"}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 bg-surface-200 text-surface-700 rounded-lg hover:bg-surface-300 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="bg-surface-0 rounded-lg shadow-sm p-6">
            <form onSubmit={handleChangePassword}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-surface-500 mt-1">
                    Tối thiểu 6 ký tự
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-surface-100">
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-6 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePasswordMutation.isPending
                    ? "Đang đổi..."
                    : "Đổi mật khẩu"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="px-6 py-2 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors"
                >
                  Quên mật khẩu?
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
