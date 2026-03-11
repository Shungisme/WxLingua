"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      alert(error.response?.data?.message || "Failed to reset password");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      alert("New password must be at least 6 characters!");
      return;
    }

    resetPasswordMutation.mutate({ code, newPassword });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-surface-50 bg-dot-grid-wrap flex items-center justify-center p-4">
        <div className="bg-surface-0 border-2 border-surface-900 shadow-pixel p-8 w-full max-w-md animate-fade-in-up">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 border-2 border-green-300 flex items-center justify-center mb-4">
              <i className="hn hn-check-circle text-3xl text-green-600" />
            </div>
            <h2 className="font-pixel text-xs text-surface-900 mb-3">
              Password reset!
            </h2>
            <p className="font-pixel text-[8px] text-surface-600 mb-6">
              Your password has been updated. Redirecting to sign in...
            </p>
            <div className="animate-spin h-8 w-8 border-4 border-accent-600 border-t-transparent mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 bg-dot-grid-wrap flex items-center justify-center p-4">
      <div className="bg-surface-0 border-2 border-surface-900 shadow-pixel p-8 w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-accent-100 border-2 border-accent-300 flex items-center justify-center mb-4">
            <i className="hn hn-lock text-3xl text-accent-600" />
          </div>
          <h1 className="font-pixel text-sm text-surface-900 mb-2">
            Reset password
          </h1>
          <p className="font-pixel text-[8px] text-surface-600">
            Enter your verification code and new password
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-pixel text-[9px] text-surface-700 mb-2">
              Verification code
            </label>
            <Input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="text-center font-pixel tracking-widest !text-[14px]"
              placeholder="000000"
              required
              maxLength={6}
              pattern="\d{6}"
            />
            <p className="font-pixel text-[7px] text-surface-400 mt-1.5">
              Check your email for the 6-digit code
            </p>
          </div>

          <div>
            <label className="block font-pixel text-[9px] text-surface-700 mb-2">
              New password
            </label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block font-pixel text-[9px] text-surface-700 mb-2">
              Confirm new password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full !text-[10px]"
            disabled={resetPasswordMutation.isPending}
          >
            {resetPasswordMutation.isPending
              ? "Resetting..."
              : "Reset password"}
          </Button>
        </form>

        {/* Links */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="secondary"
            className="w-full !text-[10px]"
            onClick={() => router.push("/forgot-password")}
          >
            Didn&apos;t receive a code? Resend
          </Button>
          <Button
            variant="destructive"
            className="w-full !text-[10px]"
            onClick={() => router.push("/login")}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
