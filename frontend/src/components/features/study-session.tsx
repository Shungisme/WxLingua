"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studyApi, type StudyCard, type Rating } from "@/lib/api";
import { Flashcard } from "./flashcard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, RotateCcw } from "lucide-react";

interface StudySessionProps {
  deckId?: string;
}

export function StudySession({ deckId }: StudySessionProps) {
  const queryClient = useQueryClient();
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [cardFlipped, setCardFlipped] = useState(false);
  const [undoing, setUndoing] = useState(false);

  const { data: cards, isLoading } = useQuery({
    queryKey: ["study-next", deckId],
    queryFn: () => studyApi.nextCards({ deckId, limit: 20 }),
  });

  const current: StudyCard | undefined = cards?.[index];

  const { data: previews } = useQuery({
    queryKey: ["study-previews", current?.word.id],
    queryFn: () =>
      current ? studyApi.previewIntervals(current.word.id) : null,
    enabled: !!current,
  });

  const logMutation = useMutation({
    mutationFn: (payload: {
      wordId?: string;
      cardId?: string;
      rating: Rating;
      timeSpent: number;
    }) => studyApi.logSession(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["study-stats"] });
    },
  });

  const handleAnswer = useCallback(
    (rating: Rating) => {
      if (!current) return;

      logMutation.mutate({
        // Use cardId for deck-based study, wordId for vocabulary study
        ...(current.cardId
          ? { cardId: current.cardId }
          : { wordId: current.word.id }),
        rating,
        timeSpent: Date.now() - startTime,
      });

      setCardFlipped(false);

      if (index + 1 >= (cards?.length ?? 0)) {
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setStartTime(Date.now());
      }
    },
    [current, index, cards, logMutation, startTime],
  );

  const handleUndo = async () => {
    if (index === 0) return;
    setUndoing(true);
    try {
      await studyApi.undo();
      queryClient.invalidateQueries({ queryKey: ["study-stats"] });
      setIndex((i) => i - 1);
      setCardFlipped(false);
      setStartTime(Date.now());
      setDone(false);
    } catch (e) {
      console.error("Failed to undo", e);
    } finally {
      setUndoing(false);
    }
  };

  if (isLoading)
    return <Skeleton className="h-64 w-full max-w-md mx-auto rounded-2xl" />;

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-surface-800">
          No cards to review!
        </h3>
        <p className="text-sm text-surface-400 mt-1">
          Come back later or add new cards.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-16 animate-fade-in relative max-w-md mx-auto">
        <div className="absolute top-0 left-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            disabled={undoing}
            className="text-surface-500"
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Undo
          </Button>
        </div>
        <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-4 mt-8" />
        <h3 className="text-2xl font-bold text-surface-900">
          Session complete!
        </h3>
        <p className="text-surface-400 mt-2">
          You reviewed {cards.length} cards.
        </p>
        <Button
          className="mt-6"
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ["study-next", deckId] });
            setIndex(0);
            setDone(false);
          }}
        >
          Continue studying
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Progress & Undo Header */}
      <div className="flex items-center justify-between w-full max-w-md">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          disabled={index === 0 || undoing || logMutation.isPending}
          className="opacity-60 hover:opacity-100"
        >
          <RotateCcw className="h-4 w-4 mr-1" /> Undo
        </Button>
        <p className="text-xs text-surface-400 font-medium">
          {index + 1} / {cards.length}
        </p>
      </div>

      {current && (
        <Flashcard
          card={current}
          forceFlip={cardFlipped}
          onFlip={(flipped) => setCardFlipped(flipped)}
        />
      )}

      {/* Answer buttons - Only visible when flipped */}
      <div
        className={`flex gap-3 w-full max-w-md transition-opacity duration-300 ${cardFlipped ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <Button
          variant="outline"
          className="flex-1 flex-col h-14 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 p-0"
          onClick={() => handleAnswer(1)}
          disabled={!cardFlipped || logMutation.isPending}
        >
          <span className="text-xs font-normal opacity-70 mb-0.5">
            {previews?.[1]?.label || "-"}
          </span>
          <span className="font-medium">Again (1)</span>
        </Button>

        <Button
          variant="outline"
          className="flex-1 flex-col h-14 border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 p-0"
          onClick={() => handleAnswer(2)}
          disabled={!cardFlipped || logMutation.isPending}
        >
          <span className="text-xs font-normal opacity-70 mb-0.5">
            {previews?.[2]?.label || "-"}
          </span>
          <span className="font-medium">Hard (2)</span>
        </Button>

        <Button
          variant="outline"
          className="flex-1 flex-col h-14 border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300 p-0"
          onClick={() => handleAnswer(3)}
          disabled={!cardFlipped || logMutation.isPending}
        >
          <span className="text-xs font-normal opacity-70 mb-0.5">
            {previews?.[3]?.label || "-"}
          </span>
          <span className="font-medium">Good (3)</span>
        </Button>

        <Button
          variant="outline"
          className="flex-1 flex-col h-14 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 p-0"
          onClick={() => handleAnswer(4)}
          disabled={!cardFlipped || logMutation.isPending}
        >
          <span className="text-xs font-normal opacity-70 mb-0.5">
            {previews?.[4]?.label || "-"}
          </span>
          <span className="font-medium">Easy (4)</span>
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      {cardFlipped && (
        <p className="text-xs text-surface-400 mt-[-1rem]">
          Press 1-4 for quick selection
        </p>
      )}
    </div>
  );
}
