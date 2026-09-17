"use client";

import { useEffect, useRef, useState } from "react";

type AdminNewsItem = {
  id: string;
  titleHy: string | null;
  titleRu: string | null;
  titleEn: string | null;
  publishedAt: string;
  published: boolean;
  mimeType: string | null;
  sourceUrl: string | null;
};

const ERRORS: Record<string, string> = {
  title_required: "Нужен заголовок хотя бы на одном языке.",
  invalid_date: "Некорректная дата.",
  image_too_large: "Картинка больше 8 МБ.",
  unsupported_type: "Такой формат картинки не поддерживается.",
  invalid_image: "Не удалось прочитать картинку.",
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function NewsAdmin() {
  const [items, setItems] = useState<AdminNewsItem[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    const res = await fetch("/api/admin/news");
    if (res.ok) setItems(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load from an external API
    void load();
  }, []);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/news", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(ERRORS[body?.error] ?? "Не удалось сохранить новость.");
      setSaving(false);
      return;
    }

    formRef.current?.reset();
    setSaving(false);
    await load();
  }

  async function togglePublished(item: AdminNewsItem) {
    setBusyId(item.id);
    await fetch(`/api/admin/news/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !item.published }),
    });
    setBusyId(null);
    await load();
  }

  async function remove(item: AdminNewsItem) {
    const title = item.titleRu ?? item.titleHy ?? item.titleEn ?? "";
    if (!confirm(`Удалить новость «${title}»? Это необратимо.`)) return;
    setBusyId(item.id);
    await fetch(`/api/admin/news/${item.id}`, { method: "DELETE" });
    setBusyId(null);
    await load();
  }

  return (
    <section className="mt-10">
      <h2 className="mb-1 text-lg font-semibold">Новости ({items.length})</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Скопируйте пост из телеграма и вставьте сюда. Достаточно заполнить один язык — на
        остальных версиях сайта покажется он же.
      </p>

      <form ref={formRef} onSubmit={create} className="space-y-4 rounded-xl border border-neutral-200 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-neutral-600">Дата</span>
            <input
              type="date"
              name="publishedAt"
              defaultValue={todayInputValue()}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
          </label>
          <label className="block text-sm">
            <span className="text-neutral-600">Ссылка на пост в телеграме (необязательно)</span>
            <input
              type="url"
              name="sourceUrl"
              placeholder="https://t.me/…"
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
          </label>
        </div>

        {(
          [
            ["Ru", "Русский"],
            ["Hy", "Հայերեն"],
            ["En", "English"],
          ] as const
        ).map(([suffix, label]) => (
          <fieldset key={suffix} className="rounded-lg border border-neutral-200 p-3">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              {label}
            </legend>
            <input
              name={`title${suffix}`}
              placeholder="Заголовок"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
            <textarea
              name={`body${suffix}`}
              rows={4}
              placeholder="Текст новости"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
          </fieldset>
        ))}

        <label className="block text-sm">
          <span className="text-neutral-600">Фото (необязательно, до 8 МБ)</span>
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="mt-1 block w-full text-sm"
          />
        </label>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          disabled={saving}
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Сохраняем…" : "Опубликовать новость"}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {items.length === 0 && <div className="text-sm text-neutral-500">Новостей пока нет.</div>}
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 rounded-xl border border-neutral-200 p-4">
            {item.mimeType && (
              // eslint-disable-next-line @next/next/no-img-element -- admin-only thumbnail of a DB-backed image
              <img
                src={`/api/news/${item.id}/image`}
                alt=""
                className="h-16 w-16 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium">{item.titleRu ?? item.titleHy ?? item.titleEn}</div>
              <div className="text-xs text-neutral-500">
                {new Date(item.publishedAt).toLocaleDateString("ru-RU")}
                {!item.published && " · скрыта"}
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  disabled={busyId === item.id}
                  onClick={() => togglePublished(item)}
                  className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-200 disabled:opacity-60"
                >
                  {item.published ? "Скрыть" : "Показать"}
                </button>
                <button
                  disabled={busyId === item.id}
                  onClick={() => remove(item)}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-60"
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
