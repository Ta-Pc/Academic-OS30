import { useCallback, useEffect, useRef, useState } from 'react';

export interface WhatIfAssignmentState { id: string; title: string; weight: number; score: number | null; maxScore: number | null; }
export interface WhatIfPredictionState { currentObtained: number; remainingWeight: number; predictedSemesterMark: number; requiredAverageOnRemaining: number | null; }

interface ApiAssignment { id: string; title: string; weight: number; score: number | null; maxScore: number | null; }
interface ApiPrediction { currentObtained: number; remainingWeight: number; predictedSemesterMark: number; requiredAverageOnRemaining: number | null }
type ApiResponse = { data: { module: { id: string; code: string; title: string; targetMark: number | null }; assignments: ApiAssignment[]; prediction: ApiPrediction; committed: boolean } };

export function useWhatIf(moduleId: string | null | undefined) {
  const [assignments, setAssignments] = useState<WhatIfAssignmentState[]>([]);
  const [prediction, setPrediction] = useState<WhatIfPredictionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState<Record<string, number | null>>({});
  const baselineRef = useRef<Record<string, number | null>>({});
  const moduleRef = useRef<{ id: string; code: string; title: string; targetMark: number | null } | null>(null);

  useEffect(() => {
    if (!moduleId) return;
    let alive = true;
    async function load() {
      setLoading(true); setError(null);
      try {
        const res = await fetch('/api/what-if', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ moduleId, sessionOnly: true, changes: [] }) });
        if (!res.ok) throw new Error('Failed to load what-if');
  const json: ApiResponse = await res.json();
        if (!alive) return;
        moduleRef.current = json.data.module;
        setAssignments(json.data.assignments.map(a => ({ id: a.id, title: a.title, weight: a.weight, score: a.score, maxScore: a.maxScore })));
        setPrediction(json.data.prediction);
        const base: Record<string, number | null> = {}; json.data.assignments.forEach(a => { base[a.id] = a.score; });
        baselineRef.current = base; setWorking(base);
  } catch (e: unknown) { if (!alive) return; const msg = e instanceof Error ? e.message : 'Failed'; setError(msg); } finally { if (alive) setLoading(false); }
    }
    load();
    return () => { alive = false; };
  }, [moduleId]);

  const updateLocal = useCallback((assignmentId: string, value: number | null) => { setWorking(w => ({ ...w, [assignmentId]: value })); }, []);
  const reset = useCallback(() => { setWorking({ ...baselineRef.current }); }, []);
  const simulate = useCallback(async () => {
    if (!moduleId) return; setLoading(true); setError(null);
    try {
      const changes = Object.entries(working).filter(([id, score]) => baselineRef.current[id] !== score).map(([assignmentId, score]) => ({ assignmentId, score }));
      const res = await fetch('/api/what-if', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ moduleId, sessionOnly: true, changes }) });
      if (!res.ok) throw new Error('Failed to simulate');
  const json: ApiResponse = await res.json();
      setPrediction(json.data.prediction);
  } catch (e: unknown) { const msg = e instanceof Error ? e.message : 'Failed'; setError(msg); } finally { setLoading(false); }
  }, [moduleId, working]);
  const commit = useCallback(async () => {
    if (!moduleId) return; setCommitting(true); setError(null);
    try {
      const changes = Object.entries(working).filter(([id, score]) => baselineRef.current[id] !== score).map(([assignmentId, score]) => ({ assignmentId, score }));
      if (!changes.length) return;
      const res = await fetch('/api/what-if', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ moduleId, sessionOnly: false, changes }) });
      if (!res.ok) throw new Error('Failed to commit');
  const json: ApiResponse = await res.json();
      setPrediction(json.data.prediction);
      const base: Record<string, number | null> = {}; json.data.assignments.forEach(a => { base[a.id] = a.score; });
      baselineRef.current = base; setWorking(base);
  } catch (e: unknown) { const msg = e instanceof Error ? e.message : 'Failed'; setError(msg); } finally { setCommitting(false); }
  }, [moduleId, working]);

  return { module: moduleRef.current, assignments, prediction, loading, committing, error, working, updateLocal, simulate, commit, reset } as const;
}

export default useWhatIf;
