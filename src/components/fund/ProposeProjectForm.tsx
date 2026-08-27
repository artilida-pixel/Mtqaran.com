"use client";

import { useState } from "react";
import type { Dictionary } from "@/lib/dictionaries";

export default function ProposeProjectForm({
  villageId,
  dict,
}: {
  villageId: string;
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("submitting");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          villageId,
          title: data.get("title"),
          description: data.get("description"),
          goalAmount: Number(data.get("goalAmount")),
          contact: data.get("contact"),
        }),
      });
      if (!res.ok) throw new Error("failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-brand-apricot px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-apricot-dark"
      >
        {dict.village.propose_button}
      </button>
    );
  }

  if (status === "success") {
    return (
      <p className="rounded-2xl border border-brand-green/30 bg-brand-green/10 p-4 text-sm text-brand-green">
        {dict.village.form.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-border bg-surface p-5">
      <div>
        <label className="mb-1 block text-sm font-medium">{dict.village.form.title}</label>
        <input
          name="title"
          required
          maxLength={140}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{dict.village.form.description}</label>
        <textarea
          name="description"
          rows={3}
          maxLength={2000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{dict.village.form.goal}</label>
        <input
          name="goalAmount"
          type="number"
          min={1}
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">{dict.village.form.contact}</label>
        <input
          name="contact"
          maxLength={200}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      {status === "error" && <p className="text-sm text-brand-red">{dict.village.form.error}</p>}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-full bg-brand-apricot px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brand-apricot-dark disabled:opacity-60"
      >
        {dict.village.form.submit}
      </button>
    </form>
  );
}
