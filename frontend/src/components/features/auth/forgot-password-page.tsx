"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      alert(error.response?.data?.message || "Failed to send reset code");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate({ email });
  };

  if (codeSent) {
    return (
      <div className="min-h-screen bg-surface-50 bg-dot-grid-wrap flex items-center justify-center p-4">
        <div className="bg-surface-0 border-2 border-surface-900 shadow-pixel p-8 w-full max-w-md animate-fade-in-up">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 border-2 border-green-300 flex items-center justify-center mb-4">
              <i className="hn hn-envelope text-3xl text-green-600" />
            </div>
            <h2 className="font-pixel text-xs text-surface-900 mb-3">
              Check your email
            </h2>
            <p className="font-pixel text-[8px] text-surface-600 mb-6">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>
            <Button
              className="w-full"
              onClick={() => router.push("/reset-password")}
            >
              Enter verification code
            </Button>
            <Button
              variant="ghost"
              className="w-full mt-3"
              onClick={() => setCodeSent(false)}
            >
              Resend code
            </Button>
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
          <h1 className="font-pixel text-sm text-surface-900 mb-2">
            Forgot password?
          </h1>
          <p className="font-pixel text-[8px] text-surface-600">
            Enter your email to receive a reset code
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-pixel text-[9px] text-surface-700 mb-2">
              Email
            </label>
            <div className="relative">
              <i className="hn hn-envelope text-xl absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={forgotPasswordMutation.isPending}
          >
            {forgotPasswordMutation.isPending
              ? "Sending..."
              : "Send reset code"}
          </Button>
        </form>

        {/* Back to login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-accent-600 hover:text-accent-700 font-pixel text-[9px]"
          >
            <i className="hn hn-arrow-left text-base" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
