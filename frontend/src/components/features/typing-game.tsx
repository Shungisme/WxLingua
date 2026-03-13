"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { studyApi } from "@/lib/api";
import type { StudyCard } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TypingGameProps {
  deckId: string;
}

function getMeaning(card: StudyCard): string {
  const meta = card.word.metadata as Record<string, unknown> | undefined;
  if (!meta) return "";
  if (typeof meta.vi === "string" && meta.vi) return meta.vi;
  if (typeof meta.en === "string" && meta.en) return meta.en;
  const reading = new Set([meta.pinyin, meta.phonetic, meta.romaja]);
  return (
    (Object.values(meta).find(
      (v) => typeof v === "string" && v && !reading.has(v),
    ) as string) ?? ""
  );
}

function getReading(card: StudyCard): string {
  const meta = card.word.metadata as Record<string, unknown> | undefined;
  if (!meta) return "";
  return (
    (meta.pinyin as string) ??
    (meta.phonetic as string) ??
    (meta.romaja as string) ??
    ""
  );
}

type AnswerState = "idle" | "correct" | "wrong" | "skipped";

export function TypingGame({ deckId }: TypingGameProps) {
  const { data: cards, isLoading } = useQuery({
    queryKey: ["study-next", deckId, "learn"],
    queryFn: () => studyApi.nextCards({ deckId, limit: 100, mode: "learn" }),
  });

  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const current: StudyCard | undefined = cards?.[index];

  // Focus input when card changes
  useEffect(() => {
    setInput("");
    setAnswerState("idle");
    setShowHint(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [index]);

  const advance = useCallback(() => {
    if (!cards) return;
    if (index + 1 >= cards.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  }, [index, cards]);

  const handleSubmit = useCallback(() => {
    if (!current || answerState !== "idle") return;
    const trimmed = input.trim();
    if (!trimmed) return;

    const correct = current.word.word;
    const isCorrect =
      trimmed === correct || trimmed.toLowerCase() === correct.toLowerCase();

    if (isCorrect) {
      setAnswerState("correct");
      setScore((s) => ({ ...s, correct: s.correct + 1 }));
    } else {
      setAnswerState("wrong");
      setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
    }
  }, [current, input, answerState]);

  const handleSkip = useCallback(() => {
    if (!current || answerState !== "idle") return;
    setAnswerState("skipped");
    setScore((s) => ({ ...s, wrong: s.wrong + 1 }));
  }, [current, answerState]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        if (answerState === "idle") {
          handleSubmit();
        } else {
          advance();
        }
      }
    },
    [answerState, handleSubmit, advance],
  );

  const restart = () => {
    setIndex(0);
    setScore({ correct: 0, wrong: 0 });
    setDone(false);
    setAnswerState("idle");
    setInput("");
  };

  if (isLoading)
    return <Skeleton className="h-64 w-full max-w-lg mx-auto rounded-2xl" />;

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-16">
        <i className="hn hn-trophy text-[40px] text-amber-400 mx-auto mb-3 block" />
        <h3 className="font-pixel text-[10px] text-surface-800">
          No cards to practice!
        </h3>
        <p className="font-pixel text-[8px] text-surface-400 mt-1">
          Add some cards to this deck first.
        </p>
      </div>
    );
  }

  if (done) {
    const total = score.correct + score.wrong;
    const pct = total > 0 ? Math.round((score.correct / total) * 100) : 0;
    return (
      <div className="text-center py-16 animate-fade-in max-w-md mx-auto">
        <i className="hn hn-trophy text-[48px] text-amber-400 mx-auto mb-4 block" />
        <h3 className="font-pixel text-sm text-surface-900">Round complete!</h3>
        <p className="font-pixel text-[8px] text-surface-500 mt-2">
          {score.correct}/{total} correct &nbsp;·&nbsp; {pct}%
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outline" onClick={restart}>
            <i className="hn hn-refresh text-base mr-1.5" />
            Restart
          </Button>
        </div>
      </div>
    );
  }

  const meaning = getMeaning(current!);
  const reading = getReading(current!);

  return (
    <div className="flex flex-col items-center gap-6 max-w-lg mx-auto">
      {/* Progress */}
      <div className="w-full flex items-center justify-between font-pixel text-[8px] text-surface-400">
        <span>
          ✓ {score.correct} &nbsp; ✗ {score.wrong}
        </span>
        <span>
          {index + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-500 rounded-full transition-all duration-300"
          style={{ width: `${((index + 1) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="w-full rounded-2xl border border-surface-200 bg-surface-0 shadow-card p-8 flex flex-col items-center gap-4">
        {/* Meaning prompt */}
        <p className="font-pixel text-[8px] text-surface-400 uppercase tracking-wider">
          Type the word for:
        </p>
        <div className="text-center">
          {meaning ? (
            <p className="font-pixel text-sm text-surface-900">{meaning}</p>
          ) : (
            <p className="font-pixel text-[8px] text-surface-400 italic">
              No meaning available
            </p>
          )}
        </div>

        {/* Reading hint */}
        {reading && (
          <button
            onClick={() => setShowHint((v) => !v)}
            className="flex items-center gap-1 font-pixel text-[8px] text-accent-500 hover:text-accent-700 transition-colors"
          >
            {showHint ? (
              <>
                <i className="hn hn-eye-cross text-[14px]" /> Hide hint
              </>
            ) : (
              <>
                <i className="hn hn-eye text-[14px]" /> Show reading
              </>
            )}
          </button>
        )}
        {showHint && reading && (
          <p className="font-pixel text-[9px] text-accent-600">{reading}</p>
        )}

        {/* Input */}
        <div className="w-full mt-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type the word…"
            disabled={answerState !== "idle"}
            className={cn(
              "w-full px-4 py-3 font-pixel text-[8px] text-center border-2 outline-none transition-all duration-200",
              "bg-surface-0 placeholder:text-surface-300",
              answerState === "idle" &&
                "border-surface-200 focus:border-accent-400",
              answerState === "correct" &&
                "border-green-400 bg-green-50 text-green-700",
              answerState === "wrong" &&
                "border-red-400 bg-red-50 text-red-700",
              answerState === "skipped" &&
                "border-surface-300 bg-surface-50 text-surface-500",
            )}
          />
        </div>

        {/* Feedback */}
        {answerState !== "idle" && (
          <div
            className={cn(
              "w-full px-4 py-3 text-center font-pixel text-[8px]",
              answerState === "correct" && "bg-green-50 text-green-700",
              (answerState === "wrong" || answerState === "skipped") &&
                "bg-red-50 text-red-700",
            )}
          >
            {answerState === "correct" && "✓ Correct!"}
            {answerState === "wrong" && (
              <>
                ✗ Wrong — correct answer:{" "}
                <span className="font-bold text-lg">{current!.word.word}</span>
              </>
            )}
            {answerState === "skipped" && (
              <>
                Skipped — answer:{" "}
                <span className="font-bold text-lg">{current!.word.word}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 w-full">
        {answerState === "idle" ? (
          <>
            <Button variant="outline" className="flex-1" onClick={handleSkip}>
              Skip
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              Check
            </Button>
          </>
        ) : (
          <Button className="w-full" onClick={advance}>
            Next <i className="hn hn-angle-right text-base ml-1" />
          </Button>
        )}
      </div>

      <p className="font-pixel text-[8px] text-surface-400">
        Press Enter to check / advance
      </p>
    </div>
  );
}
