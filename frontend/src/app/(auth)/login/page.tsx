"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { BookMarked } from "lucide-react";

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
      setError("Email hoặc mật khẩu không đúng.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <BookMarked className="h-6 w-6 text-accent-600" />
          <span className="text-xl font-bold text-surface-900">WxLingua</span>
        </div>
        <Card>
          <CardBody>
            <h1 className="text-xl font-bold text-surface-900 mb-1">
              Đăng nhập
            </h1>
            <p className="text-sm text-surface-400 mb-6">Chào mừng trở lại!</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <Input
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="mt-1">
                Đăng nhập
              </Button>
            </form>
            <p className="text-center text-xs text-surface-400 mt-4">
              Chưa có tài khoản?{" "}
              <Link
                href="/register"
                className="text-accent-600 hover:underline font-medium"
              >
                Đăng ký
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
