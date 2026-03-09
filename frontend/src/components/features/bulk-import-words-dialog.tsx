"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { decksApi } from "@/lib/api";
import type { BulkImportResult } from "@/api/DecksApi";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BulkImportWordsDialogProps {
  open: boolean;
  deckId: string;
  onClose: () => void;
  onSuccess: (addedCount: number) => void;
}

export function BulkImportWordsDialog({
  open,
  deckId,
  onClose,
  onSuccess,
}: BulkImportWordsDialogProps) {
  const [text, setText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedLines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const handleImport = async () => {
    if (parsedLines.length === 0) return;
    setIsImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await decksApi.bulkImportByText(deckId, parsedLines);
      setResult(res);
      if (res.added > 0) {
        onSuccess(res.added);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || "Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (isImporting) return;
    setText("");
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Bulk Import Words"
      description="Paste a list of words — one per line. Words must already exist in the library."
    >
      <div className="space-y-4">
        {!result ? (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={"學\n學生\n中文\n..."}
              rows={10}
              disabled={isImporting}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 focus:border-accent-500 focus:ring-2 focus:ring-accent-100 outline-none transition-colors text-sm font-mono resize-none disabled:opacity-50"
            />
            {parsedLines.length > 0 && (
              <p className="text-sm text-surface-500">
                {parsedLines.length} word{parsedLines.length !== 1 ? "s" : ""}{" "}
                to import
              </p>
            )}
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  {result.added} word{result.added !== 1 ? "s" : ""} added
                  successfully
                </p>
              </div>
            </div>

            {result.notFound.length > 0 && (
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-sm font-medium text-amber-800">
                    {result.notFound.length} word
                    {result.notFound.length !== 1 ? "s" : ""} not found in
                    library:
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.notFound.map((w) => (
                    <span
                      key={w}
                      className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-mono"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <DialogActions>
        <Button variant="ghost" onClick={handleClose} disabled={isImporting}>
          {result ? "Close" : "Cancel"}
        </Button>
        {!result && (
          <Button
            onClick={handleImport}
            disabled={parsedLines.length === 0 || isImporting}
          >
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Import {parsedLines.length > 0 ? `${parsedLines.length} ` : ""}Words
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
