import React from 'react';
import PerformanceGauge from '@/components/PerformanceGauge';
type Module = { id: string; code: string; title: string };
type StudyLog = { id: string; durationMin: number; loggedAt: Date };
type TacticalTask = { id: string; title: string; status: string; type: string; dueDate: Date };
import { prisma } from '@/lib/prisma';
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

async function fetchWeekView(userId: string, date?: string): Promise<WeekViewResponse> {
  const base = getBaseUrl();
  const url = new URL(`${base}/api/week-view`);
  url.searchParams.set('userId', userId);
  if (date) url.searchParams.set('date', date);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

export default async function WeekViewPage({ searchParams }: { searchParams?: { date?: string } }) {
  const userId = (await prisma.user.findFirst({ select: { id: true } }))?.id || '';

  let tasks: Array<Pick<TacticalTask, 'id' | 'title' | 'status' | 'type' | 'dueDate'> & { module?: Pick<Module, 'id' | 'code' | 'title'> | null }> = [];
  let totalStudyMinutes = 0;
  if (userId) {
    try {
      const data = await fetchWeekView(userId, searchParams?.date);
      tasks = data.data.tasks as any;
      totalStudyMinutes = data.data.totalStudyMinutes;
    } catch {
      // API failed; keep placeholders
    }
  }
  // Note: client toggles will include userId via user store

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-semibold">Weekly Mission Brief</h1>
      <p className="text-slate-600 mt-1">Scan and action your tasks for the week. Check items off as you complete them.</p>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {process.env.NEXT_PUBLIC_FEATURE_UI_LIBRARY === 'true' ? (
            <ClientWeekView userId={userId} date={searchParams?.date} />
          ) : (
            <TaskGroupList tasks={tasks as any} />
          )}
        </div>
        <aside className="space-y-3">
          <PerformanceGauge minutes={totalStudyMinutes} />
          <Link href="/dashboard" className="btn btn-secondary text-sm w-full justify-center">Back to Dashboard</Link>
        </aside>
      </div>
    </main>
  );
}

const ClientWeekView = NextDynamic(() => import('./WeekView.container').then(m => m.WeekViewContainer), { ssr: false });

