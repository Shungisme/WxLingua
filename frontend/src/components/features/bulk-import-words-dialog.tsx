"use client";

import { useRef, useState } from "react";
import {
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  FileSpreadsheet,
  X,
} from "lucide-react";
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
        <div className="flex items-center justify-between rounded-lg bg-surface-50 border border-surface-200 px-3 py-2">
          <p className="text-xs text-surface-500">
            Required column:{" "}
            <code className="bg-surface-100 px-1 rounded">term</code> —
            optional:{" "}
            <code className="bg-surface-100 px-1 rounded">pronunciation</code>
            {", "}
            <code className="bg-surface-100 px-1 rounded">meaning_vi</code>
            {", "}
            <code className="bg-surface-100 px-1 rounded">meaning_en</code>
            {", "}
            <code className="bg-surface-100 px-1 rounded">notes</code>
          </p>
          <a
            href="/sample-deck-import.csv"
            download
            className="ml-3 shrink-0 inline-flex items-center gap-1 text-xs text-accent-600 hover:underline font-medium"
          >
            <Download className="h-3 w-3" />
            Download sample
          </a>
        </div>

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
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors
                ${isDragging ? "border-accent-500 bg-accent-50" : "border-surface-200 hover:border-accent-400 hover:bg-surface-50"}
                ${isImporting ? "opacity-50 pointer-events-none" : ""}`}
            >
              <FileSpreadsheet className="h-10 w-10 text-surface-400" />
              <div className="text-center">
                <p className="text-sm font-medium text-surface-700">
                  Drag and drop a file here, or click to select
                </p>
                <p className="text-xs text-surface-400 mt-0.5">
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
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-50 border border-surface-200">
                <FileSpreadsheet className="h-4 w-4 text-accent-500 shrink-0" />
                <span className="text-sm text-surface-700 truncate flex-1">
                  {file.name}
                </span>
                <span className="text-xs text-surface-400 shrink-0">
                  {(file.size / 1024).toFixed(0)} KB
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="p-0.5 rounded hover:bg-surface-200 text-surface-400 hover:text-surface-700 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
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
                  Successfully added {result.added} cards
                </p>
                <p className="text-xs text-green-700 mt-0.5">
                  Total {result.total} rows — skipped {result.skipped}{" "}
                  (duplicates or missing keyword)
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogActions>
        <Button variant="ghost" onClick={handleClose} disabled={isImporting}>
          {result ? "Close" : "Cancel"}
        </Button>
        {!result && (
          <Button onClick={handleImport} disabled={!file || isImporting}>
            {isImporting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            Import
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
