import { ButtonLink } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 text-center">
      <div>
        <p className="text-7xl font-bold text-surface-200">404</p>
        <h1 className="mt-4 text-2xl font-bold text-surface-900">Trang không tồn tại</h1>
        <p className="mt-2 text-surface-400 text-sm">Đường dẫn bạn truy cập không hợp lệ.</p>
        <ButtonLink className="mt-6" href="/">Về trang chủ</ButtonLink>
      </div>
    </div>
  );
}
