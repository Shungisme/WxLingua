"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ name, email, password });
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setError(msg ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 bg-dot-grid flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        {/* Pixel logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <i className="nes-icon star is-medium" />
          <span className="font-pixel text-[12px] text-surface-900">
            WxLingua
          </span>
        </motion.div>

        {/* NES container with title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.35, ease: "easeOut" }}
          className="nes-container with-title"
        >
          <p className="title font-pixel text-[9px] bg-transparent">
            New Player
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 pt-2 font-pixel !text-xs"
          >
            <Input
              label="Display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
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
              placeholder="Min 6 characters"
              required
              minLength={6}
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
              ▶ Create account
            </Button>
          </form>

          <p className="font-pixel text-[8px] text-center text-xs text-surface-400 !mt-6">
            Already a player?{" "}
            <Link href="/login" className="text-accent-600 hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
