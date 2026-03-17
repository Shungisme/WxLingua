"use client";

import { useState } from "react";
import { useUiSettings } from "@/contexts/ui-settings-context";
import { Button } from "./button";
import { Dialog, DialogActions } from "./dialog";

interface SettingsDialogProps {
  className?: string;
}

interface ToggleRowProps {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}

function ToggleRow({ label, description, enabled, onToggle }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-2 border-black p-3">
      <div>
        <p className="font-pixel text-[8px] text-surface-900">{label}</p>
        <p className="font-pixel text-[7px] text-surface-500 mt-1">
          {description}
        </p>
      </div>
      <Button
        type="button"
        size="sm"
        variant={enabled ? "success" : "dark"}
        onClick={onToggle}
        className="min-w-[76px]"
      >
        {enabled ? "ON" : "OFF"}
      </Button>
    </div>
  );
}

export function SettingsDialog({ className }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    darkMode,
    snowEnabled,
    heartsEnabled,
    setDarkMode,
    setSnowEnabled,
    setHeartsEnabled,
  } = useUiSettings();

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open settings"
        size="sm"
        variant="secondary"
        className={`!flex text-amber-700 border-amber-300 hover:bg-amber-50 ${className ?? ""}`}
      >
        <i className="hn hn-cog text-[13px]" />
        Settings
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Display Settings"
        description="Adjust theme and visual effects"
        className="max-w-lg"
      >
        <div className="space-y-3">
          <ToggleRow
            label="Snowfall"
            description="Show falling snow across the app"
            enabled={snowEnabled}
            onToggle={() => setSnowEnabled(!snowEnabled)}
          />
          <ToggleRow
            label="Floating Hearts"
            description="Show animated pixel hearts"
            enabled={heartsEnabled}
            onToggle={() => setHeartsEnabled(!heartsEnabled)}
          />
          <ToggleRow
            label="Theme"
            description={
              darkMode ? "Dark mode is active" : "Light mode is active"
            }
            enabled={darkMode}
            onToggle={() => setDarkMode(!darkMode)}
          />
        </div>

        <DialogActions>
          <Button
            size="sm"
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
