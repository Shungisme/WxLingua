"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { studyApi, type StudyCard } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchingGameProps {
  deckId: string;
}

// How many pairs per round
const PAIRS_PER_ROUND = 6;

function getMeaning(card: StudyCard): string {
  const meta = card.word.metadata as Record<string, unknown> | undefined;
  if (!meta) return "?";
  if (typeof meta.vi === "string" && meta.vi) return meta.vi;
  if (typeof meta.en === "string" && meta.en) return meta.en;
  const reading = new Set([meta.pinyin, meta.phonetic, meta.romaja]);
  return (
    (Object.values(meta).find(
      (v) => typeof v === "string" && v && !reading.has(v),
    ) as string) ?? "?"
  );
}

type TileKind = "word" | "meaning";
type TileStatus = "default" | "selected" | "matched" | "error";

interface Tile {
  id: string; // unique tile id
  cardId: string; // which card this tile belongs to
  kind: TileKind;
  text: string;
  status: TileStatus;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRound(cards: StudyCard[]): Tile[] {
  const tiles: Tile[] = [];
  for (const card of cards) {
    tiles.push({
      id: `word-${card.id}`,
      cardId: card.id,
      kind: "word",
      text: card.word.word,
      status: "default",
    });
    tiles.push({
      id: `meaning-${card.id}`,
      cardId: card.id,
      kind: "meaning",
      text: getMeaning(card),
      status: "default",
    });
  }
  return shuffle(tiles);
}

export function MatchingGame({ deckId }: MatchingGameProps) {
  const { data: allCards, isLoading } = useQuery({
    queryKey: ["study-next", deckId, "learn"],
    queryFn: () => studyApi.nextCards({ deckId, limit: 100, mode: "learn" }),
  });

  const [roundIndex, setRoundIndex] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [done, setDone] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // Build the current round
  const startRound = useCallback((roundIdx: number, cards: StudyCard[]) => {
    const start = roundIdx * PAIRS_PER_ROUND;
    const slice = cards.slice(start, start + PAIRS_PER_ROUND);
    if (slice.length === 0) {
      setDone(true);
      return;
    }
    setTiles(buildRound(slice));
    setSelectedId(null);
    setMatchedPairs(0);
    setTotalPairs(slice.length);
    setIsChecking(false);
  }, []);

  useEffect(() => {
    if (allCards && allCards.length > 0) {
      startRound(0, allCards);
    }
  }, [allCards, startRound]);

  const handleTileClick = useCallback(
    (tile: Tile) => {
      if (isChecking) return;
      if (tile.status === "matched" || tile.status === "error") return;

      // Nothing selected yet
      if (!selectedId) {
        setSelectedId(tile.id);
        setTiles((prev) =>
          prev.map((t) =>
            t.id === tile.id ? { ...t, status: "selected" } : t,
          ),
        );
        return;
      }

      const selectedTile = tiles.find((t) => t.id === selectedId);
      if (!selectedTile) return;

      // Clicked the same tile → deselect
      if (selectedId === tile.id) {
        setSelectedId(null);
        setTiles((prev) =>
          prev.map((t) => (t.id === tile.id ? { ...t, status: "default" } : t)),
        );
        return;
      }

      // Must select different kinds (one word, one meaning)
      if (selectedTile.kind === tile.kind) {
        // Swap selection to the new tile of the same kind
        setSelectedId(tile.id);
        setTiles((prev) =>
          prev.map((t) => {
            if (t.id === selectedId) return { ...t, status: "default" };
            if (t.id === tile.id) return { ...t, status: "selected" };
            return t;
          }),
        );
        return;
      }

      // Check if they match
      setIsChecking(true);
      const isMatch = selectedTile.cardId === tile.cardId;

      if (isMatch) {
        setTiles((prev) =>
          prev.map((t) =>
            t.id === selectedId || t.id === tile.id
              ? { ...t, status: "matched" }
              : t,
          ),
        );
        setSelectedId(null);
        setIsChecking(false);
        setMatchedPairs((p) => {
          const newCount = p + 1;
          // Check if whole round is done
          if (newCount >= totalPairs) {
            // Advance to next round after short delay
            setTimeout(() => {
              if (!allCards) return;
              const nextRound = roundIndex + 1;
              const nextStart = nextRound * PAIRS_PER_ROUND;
              if (nextStart >= allCards.length) {
                setDone(true);
              } else {
                setRoundIndex(nextRound);
                startRound(nextRound, allCards);
              }
            }, 800);
          }
          return newCount;
        });
      } else {
        // Wrong match: flash error then reset
        setMistakes((m) => m + 1);
        setTiles((prev) =>
          prev.map((t) =>
            t.id === selectedId || t.id === tile.id
              ? { ...t, status: "error" }
              : t,
          ),
        );
        setTimeout(() => {
          setTiles((prev) =>
            prev.map((t) =>
              t.id === selectedId || t.id === tile.id
                ? { ...t, status: "default" }
                : t,
            ),
          );
          setSelectedId(null);
          setIsChecking(false);
        }, 700);
      }
    },
    [
      isChecking,
      selectedId,
      tiles,
      totalPairs,
      matchedPairs,
      roundIndex,
      allCards,
      startRound,
    ],
  );

  const restart = () => {
    setRoundIndex(0);
    setMistakes(0);
    setDone(false);
    if (allCards) startRound(0, allCards);
  };

  if (isLoading)
    return <Skeleton className="h-64 w-full max-w-2xl mx-auto rounded-2xl" />;

  if (!allCards || allCards.length === 0) {
    return (
      <div className="text-center py-16">
        <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-3" />
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
    const totalRounds = Math.ceil(allCards.length / PAIRS_PER_ROUND);
    return (
      <div className="text-center py-16 animate-fade-in max-w-md mx-auto">
        <Trophy className="h-12 w-12 text-amber-400 mx-auto mb-4" />
        <h3 className="font-pixel text-sm text-surface-900">All matched!</h3>
        <p className="font-pixel text-[8px] text-surface-500 mt-2">
          {allCards.length} pairs across {totalRounds} round
          {totalRounds > 1 ? "s" : ""} · {mistakes} mistake
          {mistakes !== 1 ? "s" : ""}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={restart}>
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Play again
          </Button>
        </div>
      </div>
    );
  }

  const totalRounds = Math.ceil(allCards.length / PAIRS_PER_ROUND);
  const currentRoundDisplay = roundIndex + 1;

  return (
    <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="w-full flex items-center justify-between font-pixel text-[8px] text-surface-400">
        <span>
          Round {currentRoundDisplay}/{totalRounds}
        </span>
        <span>
          {matchedPairs}/{totalPairs} matched &nbsp;·&nbsp; {mistakes} mistake
          {mistakes !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent-500 rounded-full transition-all duration-300"
          style={{
            width: `${(matchedPairs / totalPairs) * 100}%`,
          }}
        />
      </div>

      {/* Instructions */}
      <p className="font-pixel text-[8px] text-surface-500 text-center">
        Click a word and its matching meaning to pair them.
      </p>

      {/* Tile grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full">
        {tiles.map((tile) => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile)}
            disabled={tile.status === "matched"}
            className={cn(
              "rounded-xl border-2 px-3 py-4 text-center text-sm font-medium",
              "transition-all duration-200 select-none",
              "min-h-[72px] flex items-center justify-center leading-snug",
              // Default
              tile.status === "default" &&
                "border-surface-200 bg-surface-0 text-surface-800 hover:border-accent-400 hover:bg-accent-50 hover:shadow-sm cursor-pointer",
              // Selected
              tile.status === "selected" &&
                "border-accent-500 bg-accent-50 text-accent-700 shadow-md scale-[1.03] cursor-pointer",
              // Matched
              tile.status === "matched" &&
                "border-green-300 bg-green-50 text-green-700 opacity-60 cursor-default",
              // Error
              tile.status === "error" &&
                "border-red-400 bg-red-50 text-red-700 cursor-pointer",
              // word tiles get slightly different style
              tile.kind === "word" &&
                tile.status === "default" &&
                "font-bold text-base text-surface-900",
              tile.kind === "word" &&
                tile.status === "selected" &&
                "font-bold text-base",
              tile.kind === "word" &&
                tile.status === "matched" &&
                "font-bold text-base",
            )}
          >
            {tile.text}
          </button>
        ))}
      </div>

      {/* Reshuffle button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-surface-400"
        onClick={() => {
          if (allCards) startRound(roundIndex, allCards);
        }}
      >
        <Shuffle className="h-3.5 w-3.5 mr-1.5" />
        Reshuffle round
      </Button>
    </div>
  );
}
