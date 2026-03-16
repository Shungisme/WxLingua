"use client";

import Snowfall from "react-snowfall";
import { useUiSettings } from "@/contexts/ui-settings-context";

export function SnowfallOverlay() {
  const { snowEnabled } = useUiSettings();

  if (!snowEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      <Snowfall
        snowflakeCount={120}
        speed={[0.4, 1.2]}
        wind={[-0.2, 0.2]}
        radius={[0.8, 2.2]}
      />
    </div>
  );
}
