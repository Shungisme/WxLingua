"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { dictionaryApi } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import type { HandwritingStroke } from "@/types";
import { cn } from "@/lib/utils";

type Point = {
  x: number;
  y: number;
  t: number;
};

interface HandwritingInputDropdownProps {
  open: boolean;
  onClose: () => void;
  onSelectCharacter: (character: string) => void;
  language?: "zh-TW" | "zh-CN";
  className?: string;
}

export function HandwritingInputDropdown({
  open,
  onClose,
  onSelectCharacter,
  language = "zh-TW",
  className,
}: HandwritingInputDropdownProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const currentStrokeRef = useRef<Point[]>([]);

  const [strokes, setStrokes] = useState<HandwritingStroke[]>([]);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedStrokes = useDebounce(strokes, 500);

  const hasInk = useMemo(() => strokes.length > 0, [strokes]);

  useEffect(() => {
    if (open) {
      return;
    }

    setStrokes([]);
    setCandidates([]);
    setError(null);
    setIsRecognizing(false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#111111";
    context.lineWidth = 5;

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, [open]);

  useEffect(() => {
    if (!open || debouncedStrokes.length === 0) {
      return;
    }

    let isActive = true;

    const recognize = async () => {
      setIsRecognizing(true);
      setError(null);

      try {
        const result = await dictionaryApi.recognizeHandwriting({
          strokes: debouncedStrokes,
          language,
          maxCandidates: 5,
          width: 320,
          height: 320,
        });

        if (!isActive) {
          return;
        }

        setCandidates(result.candidates.map((candidate) => candidate.text));
      } catch (err: any) {
        if (!isActive) {
          return;
        }

        setCandidates([]);
        setError(
          err?.response?.data?.message ||
            "Cannot recognize handwriting right now. Please try again.",
        );
      } finally {
        if (isActive) {
          setIsRecognizing(false);
        }
      }
    };

    void recognize();

    return () => {
      isActive = false;
    };
  }, [debouncedStrokes, language, open]);

  const getPointFromEvent = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

    return {
      x,
      y,
      t: Date.now(),
    };
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const point = getPointFromEvent(event);

    if (!canvas || !context || !point) {
      return;
    }

    drawingRef.current = true;
    currentStrokeRef.current = [point];

    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) {
      return;
    }

    const context = canvasRef.current?.getContext("2d");
    const point = getPointFromEvent(event);

    if (!context || !point) {
      return;
    }

    currentStrokeRef.current.push(point);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.releasePointerCapture(event.pointerId);
    }

    const points = currentStrokeRef.current;
    currentStrokeRef.current = [];

    if (points.length < 2) {
      return;
    }

    const stroke: HandwritingStroke = {
      x: points.map((point) => Math.round(point.x)),
      y: points.map((point) => Math.round(point.y)),
      t: points.map((point) => point.t),
    };

    setStrokes((prev) => [...prev, stroke]);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    setStrokes([]);
    setCandidates([]);
    setError(null);
  };

  const handleSelect = (character: string) => {
    onSelectCharacter(character);
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute right-0 top-full mt-2 z-50 w-[min(96vw,28rem)]",
        "border-4 border-black bg-surface-0 p-3 space-y-3",
        "shadow-[4px_4px_0_#0f172a]",
        className,
      )}
    >
      <div className="flex items-center justify-between border-2 border-black bg-accent-100 px-2 py-1">
        <p className="font-pixel text-[9px] text-surface-700">Handwriting</p>
        <button
          type="button"
          aria-label="Close handwriting input"
          className="nes-btn is-error !px-2 !py-1 !text-[8px]"
          onClick={onClose}
        >
          <i className="hn hn-times text-sm" />
        </button>
      </div>

      <div className="border-2 border-black bg-white p-2 shadow-[2px_2px_0_#0f172a]">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="h-[210px] w-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="nes-btn !px-3 !py-1 !text-[8px]"
          onClick={clearCanvas}
          disabled={!hasInk}
        >
          Clear
        </button>
        <div className="ml-auto text-[10px] font-pixel text-surface-500">
          {isRecognizing ? "Recognizing..." : ""}
        </div>
      </div>

      <div className="min-h-16 border-2 border-black bg-surface-50 p-2">
        <p className="mb-2 font-pixel text-[8px] text-surface-600">
          Candidates
        </p>
        {error && <p className="text-xs text-red-600">{error}</p>}
        {!error && candidates.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {candidates.map((candidate) => (
              <button
                key={candidate}
                type="button"
                className="nes-btn !px-3 !py-1"
                onClick={() => handleSelect(candidate)}
              >
                <span className="text-base">{candidate}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
