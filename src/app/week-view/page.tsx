import React from 'react';
import PerformanceGauge from '@/components/PerformanceGauge';
type Module = { id: string; code: string; title: string };
type StudyLog = { id: string; durationMin: number; loggedAt: Date };
type TacticalTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
type TacticalTaskType = 'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN';
type TacticalTask = { id: string; title: string; status: TacticalTaskStatus; type: TacticalTaskType; dueDate: Date };
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { getBaseUrl } from '@/lib/base-url';
import Link from 'next/link';
import { TaskGroupList } from './task-group-list';
import NextDynamic from 'next/dynamic';

type WeekViewResponse = {
  data: {
    start: string | Date;
    end: string | Date;
  tasks: Array<Pick<TacticalTask, 'id' | 'title' | 'status' | 'type' | 'dueDate'> & { module?: Pick<Module, 'id' | 'code' | 'title'> | null }>;
    studyLogs: Array<Pick<StudyLog, 'id' | 'durationMin' | 'loggedAt'>>;
    totalStudyMinutes: number;
  };
};

type TaskListItem = Pick<TacticalTask, 'id' | 'title' | 'status' | 'type' | 'dueDate'> & { module?: Pick<Module, 'id' | 'code' | 'title'> | null };

async function fetchWeekView(userId: string, date?: string): Promise<WeekViewResponse> {
  const base = getBaseUrl();
  const url = new URL(`${base}/api/week-view`);
  url.searchParams.set('userId', userId);
  if (date) url.searchParams.set('date', date);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function WeekViewPage({ searchParams }: { searchParams?: { date?: string; ui?: string } }) {
  let userId = '';
  let offline = false;
  try {
    userId = (await prisma.user.findFirst({ select: { id: true } }))?.id || '';
  } catch (err) {
    // Mark offline if db unreachable
    if (
      err instanceof Prisma.PrismaClientInitializationError ||
    (typeof err === 'object' && err && 'message' in err && String((err as { message?: unknown }).message).includes("Can't reach database server"))
    ) {
      offline = true;
    }
  }

  let tasks: TaskListItem[] = [];
  let totalStudyMinutes = 0;

  if (!offline && userId) {
    try {
      const data = await fetchWeekView(userId, searchParams?.date);
  tasks = data.data.tasks as TaskListItem[];
      totalStudyMinutes = data.data.totalStudyMinutes;
    } catch {
      // API failed; continue to fallback below
    }
  }

  if (offline) {
    // Minimal offline placeholder tasks so UI renders meaningfully
    tasks = [
      {
        id: 'offline-task-intro',
        title: 'Database not running — start with: docker compose up -d db',
  status: 'PENDING',
  type: 'ADMIN',
        dueDate: new Date()
      }
    ];
  }

  const featureUIFlag = process.env.NEXT_PUBLIC_FEATURE_UI_LIBRARY === 'true' || searchParams?.ui === '1';

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold">Weekly Mission Brief</h1>
      <p className="text-slate-600 mt-1">
        {offline
          ? 'Offline mode: database not reachable. Showing placeholder instructions.'
          : 'Scan and action your tasks for the week. Check items off as you complete them.'}
      </p>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {featureUIFlag ? (
            <ClientWeekView userId={userId} date={searchParams?.date} />
          ) : (
            <TaskGroupList tasks={tasks as TaskListItem[]} />
          )}
        </div>
        <aside className="space-y-3">
          <PerformanceGauge minutes={totalStudyMinutes} />
          <Link href="/dashboard" className="btn btn-secondary text-sm w-full justify-center">Back to Dashboard</Link>
          {offline && (
            <div className="text-xs text-amber-600 border border-amber-300 rounded p-2 bg-amber-50">
              Start Postgres then run migrations & seed:
              <pre className="mt-1 whitespace-pre-wrap break-all">docker compose up -d db\nnpm exec prisma migrate deploy\nnpm run seed:bit</pre>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

const ClientWeekView = NextDynamic(() => import('./WeekView.container').then(m => m.WeekViewContainer), { ssr: false });

