"use client";

import { useEffect, useState } from "react";
import { useUiSettings } from "@/contexts/ui-settings-context";

interface Heart {
  id: number;
  left: number; // % from left
  duration: number; // seconds
  delay: number; // seconds
  small: boolean;
  opacity: number;
}

const HEART_COUNT = 10;

function generateHearts(): Heart[] {
  return Array.from({ length: HEART_COUNT }, (_, i) => ({
    id: i,
    left: 4 + Math.random() * 92,
    duration: 6 + Math.random() * 6,
    delay: Math.random() * 10,
    small: Math.random() > 0.4,
    opacity: 0.35 + Math.random() * 0.45,
  }));
}

export function FloatingHearts() {
  const { heartsEnabled } = useUiSettings();
  const [hearts, setHearts] = useState<Heart[]>([]);

  // Only generate client-side to avoid hydration mismatch
  useEffect(() => {
    setHearts(generateHearts());
  }, []);

  if (!heartsEnabled || hearts.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 9998 }}
    >
      {hearts.map(({ id, left, duration, delay, small, opacity }) => (
        <i
          key={id}
          className={`nes-icon heart${small ? " is-small" : ""}`}
          style={{
            position: "absolute",
            bottom: -40,
            left: `${left}%`,
            opacity,
            animation: `heart-float ${duration}s ${delay}s infinite ease-in`,
            imageRendering: "pixelated",
          }}
        />
      ))}
    </div>
  );
}
