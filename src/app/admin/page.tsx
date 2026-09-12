"use client";

import { useEffect, useState } from "react";

type AdminProject = {
  id: string;
  titleRu: string;
  goalAmount: number;
  raisedAmount: number;
  village: { nameRu: string };
};

type AdminPhoto = {
  id: string;
  caption: string | null;
  submittedBy: string | null;
  contact: string | null;
  village: { nameRu: string };
};

export default function AdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [pending, setPending] = useState<AdminProject[]>([]);
  const [active, setActive] = useState<AdminProject[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<AdminPhoto[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadAll() {
    const [pendingRes, activeRes, pendingPhotosRes] = await Promise.all([
      fetch("/api/admin/pending"),
      fetch("/api/admin/active"),
      fetch("/api/admin/pending-photos"),
    ]);
    if (pendingRes.status === 401) {
      setAuthorized(false);
      return;
    }
    setAuthorized(true);
    setPending(await pendingRes.json());
    setActive(activeRes.ok ? await activeRes.json() : []);
    setPendingPhotos(pendingPhotosRes.ok ? await pendingPhotosRes.json() : []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load from an external API
    void loadAll();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setLoginError("Неверный пароль");
      return;
    }
    setPassword("");
    await loadAll();
  }

  async function moderate(id: string, action: "approve" | "reject") {
    setBusyId(id);
    await fetch(`/api/admin/projects/${id}/${action}`, { method: "POST" });
    setPending((prev) => prev.filter((p) => p.id !== id));
    setBusyId(null);
    await loadAll();
  }

  async function moderatePhoto(id: string, action: "approve" | "reject") {
    setBusyId(id);
    await fetch(`/api/admin/village-photos/${id}/${action}`, { method: "POST" });
    setPendingPhotos((prev) => prev.filter((p) => p.id !== id));
    setBusyId(null);
  }

  async function updateRaised(id: string, raisedAmount: number) {
    setBusyId(id);
    await fetch(`/api/admin/projects/${id}/raised`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raisedAmount }),
    });
    setActive((prev) => prev.map((p) => (p.id === id ? { ...p, raisedAmount } : p)));
    setBusyId(null);
  }

  if (authorized === null) {
    return <div className="p-6 text-sm text-neutral-500">Загрузка…</div>;
  }

  if (!authorized) {
    return (
      <div className="mx-auto mt-16 w-full max-w-sm p-4">
        <h1 className="mb-4 text-xl font-semibold">Вход для модерации MTQARAN</h1>
        <form onSubmit={login} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-600"
          />
          {loginError && <div className="text-sm text-red-600">{loginError}</div>}
          <button className="w-full rounded-lg bg-blue-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            Войти
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-4 pb-16">
      <h1 className="mb-6 text-2xl font-semibold">Админ-панель MTQARAN</h1>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Модерация проектов ({pending.length})</h2>
        {pending.length === 0 && <div className="text-sm text-neutral-500">Новых заявок нет.</div>}
        <div className="space-y-3">
          {pending.map((p) => (
            <div key={p.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="font-medium">{p.titleRu}</div>
              <div className="text-xs text-neutral-500">
                {p.village.nameRu} · цель {p.goalAmount.toLocaleString("ru-RU")} драм
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  disabled={busyId === p.id}
                  onClick={() => moderate(p.id, "approve")}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  Одобрить
                </button>
                <button
                  disabled={busyId === p.id}
                  onClick={() => moderate(p.id, "reject")}
                  className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-60"
                >
                  Отклонить
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Модерация фото сёл ({pendingPhotos.length})</h2>
        {pendingPhotos.length === 0 && <div className="text-sm text-neutral-500">Новых фото нет.</div>}
        <div className="space-y-3">
          {pendingPhotos.map((p) => (
            <div key={p.id} className="flex gap-3 rounded-xl border border-neutral-200 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin-only preview of a pending upload */}
              <img
                src={`/api/village-photos/${p.id}/image`}
                alt=""
                className="h-24 w-24 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium">{p.village.nameRu}</div>
                {p.caption && <div className="text-sm text-neutral-700">{p.caption}</div>}
                {(p.submittedBy || p.contact) && (
                  <div className="text-xs text-neutral-500">
                    {[p.submittedBy, p.contact].filter(Boolean).join(" · ")}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    disabled={busyId === p.id}
                    onClick={() => moderatePhoto(p.id, "approve")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    Одобрить
                  </button>
                  <button
                    disabled={busyId === p.id}
                    onClick={() => moderatePhoto(p.id, "reject")}
                    className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-60"
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">Собранные суммы ({active.length})</h2>
        <div className="space-y-3">
          {active.map((p) => (
            <div key={p.id} className="rounded-xl border border-neutral-200 p-4">
              <div className="font-medium">{p.titleRu}</div>
              <div className="text-xs text-neutral-500">{p.village.nameRu} · цель {p.goalAmount.toLocaleString("ru-RU")} драм</div>
              <form
                className="mt-3 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem("raised") as HTMLInputElement;
                  updateRaised(p.id, Number(input.value));
                }}
              >
                <input
                  name="raised"
                  type="number"
                  min={0}
                  defaultValue={p.raisedAmount}
                  className="w-40 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
                />
                <button
                  disabled={busyId === p.id}
                  className="rounded-lg bg-blue-900 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 disabled:opacity-60"
                >
                  Сохранить
                </button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
