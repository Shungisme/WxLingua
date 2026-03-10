"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 bg-dot-grid flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        {/* Pixel logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <i className="nes-icon heart is-medium" />
          <span className="font-pixel text-[12px] text-surface-900">
            WxLingua
          </span>
        </div>

        {/* NES container with title */}
        <div className="nes-container with-title">
          <p className="title font-pixel text-[9px]">Player Login</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && (
              <div
                className="nes-container is-rounded"
                style={{ padding: "0.75rem 1rem" }}
              >
                <p className="text-xs text-red-600">{error}</p>
              </div>
            )}
            <Button type="submit" loading={loading} className="w-full mt-2">
              ▶ Sign in
            </Button>
          </form>

          <p className="text-center text-xs text-surface-400 mt-6">
            No account?{" "}
            <Link
              href="/register"
              className="text-accent-600 hover:underline font-pixel text-[8px]"
            >
              Register
            </Link>
          </p>
          <p className="text-center mt-2">
            <Link
              href="/forgot-password"
              className="text-xs text-surface-400 hover:text-accent-600 transition-colors"
            >
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
