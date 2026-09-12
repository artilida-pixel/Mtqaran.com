"use client";

import { useRef, useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

export default function VillagePhotoForm({
  villageId,
  dict,
  onSubmitted,
}: {
  villageId: string;
  dict: Dictionary;
  onSubmitted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorKey, setErrorKey] = useState<"error" | "file_too_large" | "select_file_first">("error");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = dict.village.photo_form;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setErrorKey("select_file_first");
      setStatus("error");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setErrorKey("file_too_large");
      setStatus("error");
      return;
    }

    const data = new FormData(form);
    data.set("villageId", villageId);
    setStatus("submitting");
    try {
      const res = await fetch("/api/village-photos", { method: "POST", body: data });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      form.reset();
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      onSubmitted?.();
    } catch {
      setErrorKey("error");
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand-apricot px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-apricot-dark"
      >
        {dict.village.add_photo_button}
      </button>
    );
  }

  if (status === "success") {
    return (
      <p className="rounded-2xl border border-brand-green/30 bg-brand-green/10 p-4 text-sm text-brand-green">
        {t.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-5">
      <div>
        <label className="mb-1 block text-sm font-medium">{t.file}</label>
        <input
          ref={fileInputRef}
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/heic,image/heif"
          required
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-brand-apricot file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink"
        />
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview, not a build-time asset
          <img src={previewUrl} alt="" className="mt-3 h-40 w-full rounded-xl object-cover" />
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t.caption}</label>
        <input
          name="caption"
          maxLength={500}
          placeholder={t.caption_placeholder}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t.name}</label>
        <input
          name="submittedBy"
          maxLength={120}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{t.contact}</label>
        <input
          name="contact"
          maxLength={200}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      {status === "error" && <p className="text-sm text-brand-red">{t[errorKey]}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-brand-apricot px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-apricot-dark disabled:opacity-60"
      >
        {t.submit}
      </button>
    </form>
  );
}
