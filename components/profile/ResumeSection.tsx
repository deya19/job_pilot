"use client";

import { CheckCircle2, Download, FileText, Loader2, Upload, Wand2, XCircle } from "lucide-react";
import { useRef, useState } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type Props = {
  existingUrl?: string | null;
  onUpload: (url: string) => void;
  onExtract?: () => void;
  isExtracting?: boolean;
  extractError?: string | null;
  extractSuccess?: boolean;
  onGenerate?: () => void;
  isGenerating?: boolean;
  generateError?: string | null;
  generateSuccess?: boolean;
};

export function ResumeSection({
  existingUrl,
  onUpload,
  onExtract,
  isExtracting = false,
  extractError = null,
  extractSuccess = false,
  onGenerate,
  isGenerating = false,
  generateError = null,
  generateSuccess = false,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentUrl = existingUrl ?? localUrl;

  const handleDownload = async (): Promise<void> => {
    setIsDownloading(true);
    try {
      const res = await fetch("/api/resume/download");
      if (!res.ok) {
        setIsDownloading(false);
        return;
      }
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      // silent — download failed
    } finally {
      setIsDownloading(false);
    }
  };

  const uploadFile = async (file: File): Promise<void> => {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are accepted");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("uploading");
    setUploadError(null);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", file.name);

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      const json = (await res.json()) as { success: boolean; url?: string; error?: string };

      if (!json.success || !json.url) {
        setUploadError(json.error ?? "Upload failed");
        setUploadStatus("error");
        return;
      }

      setUploadStatus("success");
      setLocalUrl(json.url);
      onUpload(json.url);
    } catch {
      setUploadError("Upload failed. Please try again.");
      setUploadStatus("error");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (): void => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) void uploadFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) void uploadFile(file);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="text-base font-semibold text-text-primary">Resume</h2>
      <p className="mt-1 text-xs text-text-secondary">
        Upload or existing resume to auto-fill your profile and tailor it for
        each role. Select one from your device.
      </p>

      <div className="mt-4">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
            isDragging
              ? "border-accent bg-accent-muted"
              : uploadStatus === "error"
                ? "border-error bg-surface-secondary"
                : uploadStatus === "success"
                  ? "border-success bg-surface-secondary"
                  : "border-border bg-surface-secondary"
          }`}
        >
          {uploadStatus === "uploading" ? (
            <Loader2 className="mb-3 h-6 w-6 animate-spin text-accent" />
          ) : uploadStatus === "error" ? (
            <XCircle className="mb-3 h-6 w-6 text-error" />
          ) : uploadStatus === "success" ? (
            <CheckCircle2 className="mb-3 h-6 w-6 text-success" />
          ) : (
            <Upload className="mb-3 h-6 w-6 text-text-muted" />
          )}

          {uploadStatus === "uploading" ? (
            <p className="text-sm font-medium text-text-primary">Uploading...</p>
          ) : uploadStatus === "success" ? (
            <p className="text-sm font-medium text-success">
              {fileName ?? "Resume uploaded successfully"}
            </p>
          ) : uploadStatus === "error" ? (
            <p className="text-sm font-medium text-error">
              {uploadError ?? "Upload failed"}
            </p>
          ) : currentUrl ? (
            <p className="text-sm font-medium text-text-primary">
              Resume on file
            </p>
          ) : (
            <p className="text-sm font-medium text-text-primary">
              {fileName ?? "Click to upload or drag and drop"}
            </p>
          )}

          {uploadStatus === "success" && (
            <p className="mt-1 text-xs text-success">Upload complete</p>
          )}

          {uploadStatus !== "uploading" && !currentUrl && uploadStatus !== "error" && uploadStatus !== "success" && (
            <p className="mt-1 text-xs text-text-muted">PDF only. Maximum file size 10MB.</p>
          )}

          <button
            type="button"
            disabled={uploadStatus === "uploading"}
            onClick={() => inputRef.current?.click()}
            className="mt-4 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploadStatus === "success" ? "Replace Resume" : "Select Resume"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            aria-label="Upload resume PDF"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {currentUrl && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={isDownloading}
            onClick={() => void handleDownload()}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-surface-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isDownloading ? "Downloading..." : "Download Resume"}
          </button>
        </div>
      )}

      {currentUrl && onExtract && (
        <div className={`mt-4 rounded-lg border p-4 transition-colors ${
          extractSuccess
            ? "border-success bg-surface-secondary"
            : extractError
              ? "border-error bg-surface-secondary"
              : "border-border bg-surface-secondary"
        }`}>
          <div className="flex items-center gap-3">
            {extractSuccess ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
            ) : extractError ? (
              <XCircle className="h-5 w-5 shrink-0 text-error" />
            ) : (
              <FileText className="h-5 w-5 shrink-0 text-accent" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">
                Auto-fill your profile
              </p>
              <p className="text-xs text-text-secondary">
                {extractSuccess
                  ? "Profile fields populated from your resume"
                  : extractError
                    ? extractError
                    : "Extract information from your uploaded resume"}
              </p>
            </div>
            <button
              type="button"
              disabled={isExtracting}
              onClick={onExtract}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {extractSuccess ? "Re-extract" : "Extract from Resume"}
                </>
              )}
            </button>
          </div>
          {extractSuccess && (
            <p className="mt-2 text-xs text-success">
              Review the fields below and click Save Profile when ready.
            </p>
          )}
        </div>
      )}

      <div className={`mt-4 rounded-lg border p-4 transition-colors ${
        generateSuccess
          ? "border-success bg-surface-secondary"
          : generateError
            ? "border-error bg-surface-secondary"
            : "border-border bg-surface-secondary"
      }`}>
        <div className="flex items-center gap-3">
          {generateSuccess ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          ) : generateError ? (
            <XCircle className="h-5 w-5 shrink-0 text-error" />
          ) : (
            <Wand2 className="h-5 w-5 shrink-0 text-accent" />
          )}
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">
              Generate Resume from Profile
            </p>
            <p className="text-xs text-text-secondary">
              {generateSuccess
                ? "Resume generated and saved successfully"
                : generateError
                  ? generateError
                  : "Create a polished PDF resume from your saved profile data"}
            </p>
          </div>
          {onGenerate && (
            <button
              type="button"
              disabled={isGenerating}
              onClick={onGenerate}
              className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {generateSuccess ? "Regenerate" : "Generate"}
                </>
              )}
            </button>
          )}
        </div>
        {generateSuccess && (
          <p className="mt-2 text-xs text-success">
            Resume generated and saved. Use the Download Resume button above to save it.
          </p>
        )}
      </div>
    </div>
  );
}
