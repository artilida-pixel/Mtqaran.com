"use client";

import { useEffect, useRef, useState } from "react";

type AdminLecturer = {
  id: string;
  nameRu: string;
  nameHy: string;
  nameEn: string;
  titleRu: string | null;
  photo: string | null;
  photoMime: string | null;
  order: number;
};

const ERRORS: Record<string, string> = {
  name_required: "Нужно имя хотя бы на одном языке.",
  image_too_large: "Фото больше 8 МБ.",
  unsupported_type: "Такой формат фото не поддерживается.",
  invalid_image: "Не удалось прочитать фото.",
};

const LINK_FIELDS = [
  ["telegram", "Telegram"],
  ["instagram", "Instagram"],
  ["facebook", "Facebook"],
  ["youtube", "YouTube"],
  ["website", "Сайт"],
] as const;

export default function LecturersAdmin() {
  const [lecturers, setLecturers] = useState<AdminLecturer[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function load() {
    const res = await fetch("/api/admin/lecturers");
    if (res.ok) setLecturers(await res.json());
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load from an external API
    void load();
  }, []);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch("/api/admin/lecturers", {
      method: "POST",
      body: new FormData(e.currentTarget),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(ERRORS[body?.error] ?? "Не удалось сохранить преподавателя.");
      setSaving(false);
      return;
    }

    formRef.current?.reset();
    setSaving(false);
    await load();
  }

  async function remove(lecturer: AdminLecturer) {
    if (!confirm(`Удалить «${lecturer.nameRu}»? Это необратимо.`)) return;
    setBusyId(lecturer.id);
    await fetch(`/api/admin/lecturers/${lecturer.id}`, { method: "DELETE" });
    setBusyId(null);
    await load();
  }

  return (
    <section className="mt-10">
      <h2 className="mb-1 text-lg font-semibold">Преподаватели ({lecturers.length})</h2>
      <p className="mb-4 text-sm text-neutral-500">
        Показываются на главной кружочками с биографией и ссылками. Достаточно заполнить один
        язык. Порядок — меньше число, выше в списке.
      </p>

      <form ref={formRef} onSubmit={create} className="space-y-4 rounded-xl border border-neutral-200 p-4">
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
              name={`name${suffix}`}
              placeholder="Имя и фамилия"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
            <input
              name={`title${suffix}`}
              placeholder="Кто он — например «историк, кандидат наук»"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
            <textarea
              name={`bio${suffix}`}
              rows={3}
              placeholder="Биография"
              className="mt-2 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
          </fieldset>
        ))}

        <div className="grid gap-3 sm:grid-cols-2">
          {LINK_FIELDS.map(([name, label]) => (
            <label key={name} className="block text-sm">
              <span className="text-neutral-600">{label}</span>
              <input
                type="url"
                name={name}
                placeholder="https://…"
                className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="text-neutral-600">Порядок</span>
            <input
              type="number"
              name="order"
              defaultValue={0}
              className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
            />
          </label>
        </div>

        <label className="block text-sm">
          <span className="text-neutral-600">Фото (обрежется в квадрат, до 8 МБ)</span>
          <input
            type="file"
            name="photo"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            className="mt-1 block w-full text-sm"
          />
        </label>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <button
          disabled={saving}
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Сохраняем…" : "Добавить преподавателя"}
        </button>
      </form>

      <div className="mt-4 space-y-3">
        {lecturers.length === 0 && (
          <div className="text-sm text-neutral-500">
            Преподавателей пока нет — блок на главной не показывается.
          </div>
        )}
        {lecturers.map((lecturer) => (
          <div key={lecturer.id} className="flex items-center gap-3 rounded-xl border border-neutral-200 p-4">
            {(lecturer.photoMime || lecturer.photo) && (
              // eslint-disable-next-line @next/next/no-img-element -- admin-only thumbnail of a DB-backed image
              <img
                src={lecturer.photoMime ? `/api/lecturers/${lecturer.id}/photo` : lecturer.photo!}
                alt=""
                className="h-14 w-14 shrink-0 rounded-full object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="font-medium">{lecturer.nameRu}</div>
              {lecturer.titleRu && <div className="text-sm text-neutral-700">{lecturer.titleRu}</div>}
              <div className="text-xs text-neutral-500">порядок {lecturer.order}</div>
            </div>
            <button
              disabled={busyId === lecturer.id}
              onClick={() => remove(lecturer)}
              className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-60"
            >
              Удалить
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
