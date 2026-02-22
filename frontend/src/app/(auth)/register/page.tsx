'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { authApi } from '@/lib/api';
import { BookMarked } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.register({ name, email, password });
      localStorage.setItem('access_token', data.access_token);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? 'Đăng ký thất bại. Thử lại sau.');
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
            <h1 className="text-xl font-bold text-surface-900 mb-1">Tạo tài khoản</h1>
            <p className="text-sm text-surface-400 mb-6">Miễn phí, không cần thẻ tín dụng.</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Tên hiển thị"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vòng Hùng"
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
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                minLength={6}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="mt-1">
                Đăng ký
              </Button>
            </form>
            <p className="text-center text-xs text-surface-400 mt-4">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-accent-600 hover:underline font-medium">
                Đăng nhập
              </Link>
            </p>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
