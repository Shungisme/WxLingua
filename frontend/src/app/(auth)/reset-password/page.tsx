"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Lock, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = useMutation({
    mutationFn: (data: { code: string; newPassword: string }) =>
      authApi.resetPassword(data),
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Đặt lại mật khẩu thất bại");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    resetPasswordMutation.mutate({ code, newPassword });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-surface-0 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 mb-3">
              Đặt lại mật khẩu thành công!
            </h2>
            <p className="text-surface-600 mb-6">
              Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển đến trang
              đăng nhập...
            </p>
            <div className="animate-spin h-8 w-8 border-4 border-accent-600 border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-surface-0 rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-accent-600" />
          </div>
          <h1 className="text-3xl font-bold text-surface-900 mb-2">
            Đặt lại mật khẩu
          </h1>
          <p className="text-surface-600">
            Nhập mã xác nhận và mật khẩu mới của bạn
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Mã xác nhận (6 chữ số)
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="w-full px-4 py-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent text-center text-2xl font-bold tracking-widest"
              placeholder="000000"
              required
              maxLength={6}
              pattern="\d{6}"
            />
            <p className="text-xs text-surface-500 mt-1">
              Kiểm tra email để lấy mã xác nhận
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Mật khẩu mới
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resetPasswordMutation.isPending
              ? "Đang đặt lại..."
              : "Đặt lại mật khẩu"}
          </button>
        </form>

        {/* Links */}
        <div className="mt-6 flex flex-col gap-3 text-center">
          <Link
            href="/forgot-password"
            className="text-accent-600 hover:text-accent-700 font-medium text-sm"
          >
            Chưa nhận được mã? Gửi lại
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 text-surface-600 hover:text-surface-800 font-medium text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
