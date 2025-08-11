"use client";

import React, { useMemo, useState, useTransition } from 'react';
// user store pruned
type TacticalTask = { id: string; title: string; status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'; type: 'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN'; dueDate: Date };
type TacticalTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
type TacticalTaskType = 'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN';

type TaskLite = Pick<TacticalTask, 'id' | 'title' | 'status' | 'type' | 'dueDate'> & {
  module?: { id: string; code: string; title: string } | null;
};

const TYPE_LABELS: Record<TacticalTaskType, string> = {
  READ: 'Read',
  STUDY: 'Study',
  PRACTICE: 'Practice',
  REVIEW: 'Review',
  ADMIN: 'Admin',
};

function groupByType(tasks: TaskLite[]): Record<TacticalTaskType, TaskLite[]> {
  return tasks.reduce<Record<TacticalTaskType, TaskLite[]>>((acc, t) => {
    (acc[t.type] ||= []).push(t);
    return acc;
  }, { READ: [], STUDY: [], PRACTICE: [], REVIEW: [], ADMIN: [] });
}

async function toggleTask(taskId: string, nextStatus: TacticalTaskStatus, userId?: string) {
  const res = await fetch(`/api/tactical-tasks/${taskId}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: nextStatus, userId }),
  });
  if (!res.ok) throw new Error('Failed to update task');
  return res.json();
}

export function TaskGroupList({ tasks }: { tasks: TaskLite[] }) {
  const [local, setLocal] = useState<TaskLite[]>(tasks);
  const [, startTransition] = useTransition();
  // user context removed

  const grouped = useMemo(() => groupByType(local), [local]);

  const onToggle = (task: TaskLite) => {
    const next: TacticalTaskStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    // optimistic update
    setLocal((cur) => cur.map((t) => (t.id === task.id ? { ...t, status: next } : t)));
    startTransition(async () => {
      try {
  await toggleTask(task.id, next, undefined);
      } catch {
        // revert on failure
        setLocal((cur) => cur.map((t) => (t.id === task.id ? { ...t, status: task.status } : t)));
      }
    });
  };

  const types: TacticalTaskType[] = ['READ', 'STUDY', 'PRACTICE', 'REVIEW', 'ADMIN'];

  return (
    <div className="space-y-6">
      {types.map((type) => {
        const items = grouped[type] || [];
        return (
          <section key={type} className="card">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{TYPE_LABELS[type]}</div>
              <div className="text-xs text-slate-500">{items.length} item{items.length === 1 ? '' : 's'}</div>
            </div>
            <div className="card-body p-0">
              {items.length === 0 ? (
                <div className="p-4 text-sm text-slate-500">No tasks</div>
              ) : (
                <ul className="divide-y divide-slate-200">
                  {items.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={t.status === 'COMPLETED'}
                        onChange={() => onToggle(t)}
                        className="h-4 w-4 accent-primary-600"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {t.title}
                          <span className="ml-2 text-xs text-slate-500">{new Date(t.dueDate).toLocaleString()}</span>
                        </div>
                        <div className="text-xs text-slate-600 truncate">
                          {t.module?.code || t.module?.title || ''}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}


