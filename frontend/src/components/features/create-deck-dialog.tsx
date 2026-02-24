"use client";

import { useState } from "react";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { decksApi, type CreateDeckRequest, type Deck } from "@/lib/api";

interface CreateDeckDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (deck: Deck) => void;
}

export function CreateDeckDialog({
  open,
  onClose,
  onSuccess,
}: CreateDeckDialogProps) {
  const [formData, setFormData] = useState<CreateDeckRequest>({
    name: "",
    description: "",
    languageCode: "zh-CN",
    isPublic: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên bộ thẻ");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newDeck = await decksApi.create({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        languageCode: formData.languageCode || undefined,
        isPublic: formData.isPublic,
      });

      // Reset form
      setFormData({
        name: "",
        description: "",
        languageCode: "zh-CN",
        isPublic: false,
      });

      onSuccess?.(newDeck);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể tạo bộ thẻ");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: "",
        description: "",
        languageCode: "zh-CN",
        isPublic: false,
      });
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Tạo bộ thẻ mới"
      description="Tạo bộ flashcard để lưu trữ và học từ vựng"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="deck-name"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Tên bộ thẻ <span className="text-red-500">*</span>
            </label>
            <Input
              id="deck-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ví dụ: HSK 1, Từ vựng hàng ngày..."
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="deck-description"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Mô tả
            </label>
            <textarea
              id="deck-description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn về bộ thẻ này..."
              rows={3}
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-colors text-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="deck-language"
              className="block text-sm font-medium text-surface-700 mb-1.5"
            >
              Ngôn ngữ
            </label>
            <select
              id="deck-language"
              value={formData.languageCode || ""}
              onChange={(e) =>
                setFormData({ ...formData, languageCode: e.target.value })
              }
              disabled={isLoading}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Chọn ngôn ngữ</option>
              <option value="zh-CN">中文 (Tiếng Trung)</option>
              <option value="en">English (Tiếng Anh)</option>
              <option value="ja">日本語 (Tiếng Nhật)</option>
              <option value="ko">한국어 (Tiếng Hàn)</option>
            </select>
          </div>

          {/* Public */}
          <div className="flex items-center gap-2">
            <input
              id="deck-public"
              type="checkbox"
              checked={formData.isPublic}
              onChange={(e) =>
                setFormData({ ...formData, isPublic: e.target.checked })
              }
              disabled={isLoading}
              className="h-4 w-4 rounded border-surface-300 text-accent-600 focus:ring-accent-500"
            />
            <label
              htmlFor="deck-public"
              className="text-sm text-surface-700 cursor-pointer"
            >
              Công khai (cho phép người khác xem và sử dụng)
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <DialogActions>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang tạo..." : "Tạo bộ thẻ"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
