"use client";
import React, { useState } from "react";
// user store pruned

type CreatedModule = { id: string; code: string; title: string; creditHours: number };
type Props = { onCreated?: (created: CreatedModule) => void };

export default function AddModuleForm({ onCreated }: Props) {
  // user context removed
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [credits, setCredits] = useState(12);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/modules", {
        method: "POST",
        headers: { "content-type": "application/json" },
  body: JSON.stringify({ code: code.trim(), title: (title || code).trim(), creditHours: Number(credits) || 12 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "failed");
      setCode("");
      setTitle("");
      setCredits(12);
      onCreated?.(data.data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'failed';
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div>
        <label className="block text-sm font-medium text-slate-700">Code</label>
        <input className="input w-44" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. INF 164" required />
      </div>
      <div className="min-w-[16rem]">
        <label className="block text-sm font-medium text-slate-700">Title</label>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Optional" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Credits</label>
        <input className="input w-24" type="number" min={0} step={1} value={credits} onChange={(e) => setCredits(parseInt(e.target.value, 10))} />
      </div>
      <button disabled={busy || !code} className="btn btn-primary" type="submit">
        {busy ? "Adding..." : "Add Module"}
      </button>
      {error ? <div className="text-sm text-danger-600">{error}</div> : null}
    </form>
  );
}



