import type { Metadata } from 'next';
import { StudySession } from '@/components/features/study-session';

export const metadata: Metadata = { title: 'Học ngay' };

export default function StudyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold text-surface-900 mb-1">Phiên học</h1>
      <p className="text-sm text-surface-400 mb-8">Ôn tập các thẻ đến hạn theo thuật toán SRS.</p>
      <StudySession />
    </div>
  );
}
