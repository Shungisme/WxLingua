"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const forgotPasswordMutation = useMutation({
    mutationFn: (data: { email: string }) => authApi.forgotPassword(data),
    onSuccess: () => {
      setCodeSent(true);
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || "Gửi mã thất bại");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email });
  };

  if (codeSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-accent-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-surface-0 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-surface-900 mb-3">
              Kiểm tra email
            </h2>
            <p className="text-surface-600 mb-6">
              Chúng tôi đã gửi mã xác nhận 6 chữ số đến email{" "}
              <strong>{email}</strong>
            </p>
            <button
              onClick={() => router.push("/reset-password")}
              className="w-full px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-medium"
            >
              Nhập mã xác nhận
            </button>
            <button
              onClick={() => setCodeSent(false)}
              className="w-full mt-3 px-6 py-3 text-accent-600 hover:bg-accent-50 rounded-lg transition-colors font-medium"
            >
              Gửi lại mã
            </button>
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
          <h1 className="text-3xl font-bold text-surface-900 mb-2">
            Quên mật khẩu?
          </h1>
          <p className="text-surface-600">
            Nhập email của bạn để nhận mã xác nhận
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-accent-600 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full px-6 py-3 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {forgotPasswordMutation.isPending
              ? "Đang gửi..."
              : "Gửi mã xác nhận"}
          </button>
        </form>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
