"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { studyApi, type StudyCard } from "@/lib/api";
import { Flashcard } from "./flashcard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";

interface StudySessionProps {
  deckId?: string;
}

export function StudySession({ deckId }: StudySessionProps) {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());

  const { data: cards, isLoading } = useQuery({
    queryKey: ["study-next", deckId],
    queryFn: () => studyApi.nextCards({ deckId, limit: 20 }),
  });

  const logMutation = useMutation({
    mutationFn: (payload: {
      wordId: string;
      correct: boolean;
      timeSpent: number;
    }) => studyApi.logSession(payload),
  });

  const current: StudyCard | undefined = cards?.[index];

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!current) return;
      logMutation.mutate({
        wordId: current.word.id,
        correct,
        timeSpent: Date.now() - startTime,
      });
      if (index + 1 >= (cards?.length ?? 0)) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setStartTime(Date.now());
      }
    },
    [current, index, cards, logMutation, startTime],
  );

  if (isLoading)
    return <Skeleton className="h-64 w-full max-w-md mx-auto rounded-2xl" />;

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-surface-800">
          Không có thẻ nào cần ôn!
        </h3>
        <p className="text-sm text-surface-400 mt-1">
          Quay lại sau hoặc thêm thẻ mới.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-surface-900">Xong phiên học!</h3>
        <p className="text-surface-400 mt-2">Bạn đã ôn {cards.length} thẻ.</p>
        <Button
          className="mt-6"
          onClick={() => {
            setIndex(0);
            setDone(false);
          }}
        >
          Học lại
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 self-stretch">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i < index
                ? "bg-accent-500"
                : i === index
                  ? "bg-accent-300"
                  : "bg-surface-200"
            }`}
          />
        ))}
      </div>

      <p className="text-xs text-surface-400">
        {index + 1} / {cards.length}
      </p>

      {current && <Flashcard card={current} />}

      {/* Answer buttons */}
      <div className="flex gap-4 w-full max-w-md">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          onClick={() => handleAnswer(false)}
          loading={logMutation.isPending}
        >
          <XCircle className="h-4 w-4" />
          Sai
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300"
          onClick={() => handleAnswer(true)}
          loading={logMutation.isPending}
        >
          <CheckCircle2 className="h-4 w-4" />
          Đúng
        </Button>
      </div>
    </div>
  );
}
