"use client";

import { useRef, useState } from "react";
import { decksApi } from "@/lib/api";
import type { BulkFileImportResult } from "@/api/DecksApi";
import { Dialog, DialogActions } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BulkImportWordsDialogProps {
  open: boolean;
  deckId: string;
  onClose: () => void;
  onSuccess: (addedCount: number) => void;
}

const ACCEPTED = ".csv,.xlsx,.xls";

export function BulkImportWordsDialog({
  open,
  deckId,
  onClose,
  onSuccess,
}: BulkImportWordsDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<BulkFileImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickFile = (f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "xlsx", "xls"].includes(ext)) {
      setError("Only .csv, .xlsx, or .xls files are supported");
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) pickFile(dropped);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) pickFile(picked);
    e.target.value = "";
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await decksApi.bulkImportFromFile(deckId, file);
      setResult(res);
      if (res.added > 0) onSuccess(res.added);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Import failed";
      setError(msg);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    if (isImporting) return;
    setFile(null);
    setResult(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Bulk Import Cards"
      description="Upload a CSV or Excel file to add multiple cards at once."
    >
      <div className="space-y-4">
        {/* Instructions with sample download */}
        <div className="flex items-center justify-between border-2 border-black bg-surface-50 px-3 py-2 shadow-pixel-sm">
          <a
            href="/sample-deck-import.xlsx"
            download
            className="ml-3 shrink-0 inline-flex items-center gap-1 font-pixel text-[8px] text-accent-600 hover:underline"
          >
            <i className="hn hn-download text-xs" />
            Download sample
          </a>
        </div>

        <p className="font-pixel text-[8px] text-surface-500 leading-relaxed">
          Prefer <strong>XLSX</strong> when editing in Excel to avoid
          Vietnamese/Chinese character encoding issues.
        </p>

        {!result ? (
          <>
            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-3 border-[3px] border-dashed border-black px-6 py-10 cursor-pointer transition-colors shadow-pixel-sm
                ${isDragging ? "bg-accent-100" : "bg-surface-0 hover:bg-surface-50"}
                ${isImporting ? "opacity-50 pointer-events-none" : ""}`}
            >
              <i className="hn hn-file-import text-[40px] text-surface-400" />
              <div className="text-center">
                <p className="font-pixel text-[9px] text-surface-700">
                  Drag and drop a file here, or click to select
                </p>
                <p className="font-pixel text-[8px] text-surface-500 mt-1">
                  CSV, XLSX, XLS — max 2 MB
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Selected file chip */}
            {file && (
              <div className="flex items-center gap-2 px-3 py-2 border-2 border-black bg-surface-50 shadow-pixel-sm">
                <i className="hn hn-file-import text-base text-accent-500 shrink-0" />
                <span className="font-pixel text-[8px] text-surface-700 truncate flex-1">
                  {file.name}
                </span>
                <span className="font-pixel text-[8px] text-surface-500 shrink-0">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="h-6 w-6 border border-black bg-surface-100 hover:bg-surface-200 text-surface-500 hover:text-surface-700 transition-colors inline-flex items-center justify-center"
                >
                  <i className="hn hn-times text-[14px]" />
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 border-2 border-red-300 bg-red-50 shadow-pixel-sm">
                <i className="hn hn-exclamation-triangle text-base text-red-500 shrink-0 mt-0.5" />
                <p className="font-pixel text-[8px] text-red-600 leading-relaxed">
                  {error}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 border-2 border-green-300 bg-green-50 shadow-pixel-sm">
              <i className="hn hn-check-circle text-xl text-green-600 shrink-0" />
              <div>
                <p className="font-pixel text-[9px] text-green-800">
                  Successfully added {result.added} cards
                </p>
                <p className="font-pixel text-[8px] text-green-700 mt-1 leading-relaxed">
                  Total {result.total} rows — skipped {result.skipped}{" "}
                  (duplicates or missing keyword)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogActions>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleClose}
          disabled={isImporting}
        >
          {result ? "Close" : "Cancel"}
        </Button>
        {!result && (
          <Button
            size="sm"
            onClick={handleImport}
            disabled={!file || isImporting}
          >
            {isImporting ? (
              <i className="hn hn-spinner text-base animate-spin mr-2" />
            ) : (
              <i className="hn hn-upload text-base mr-2" />
            )}
            Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
