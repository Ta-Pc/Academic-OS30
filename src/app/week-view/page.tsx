import React from 'react';
import PerformanceGauge from '@/components/PerformanceGauge';
type Module = { id: string; code: string; title: string };
type TacticalTaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
type TacticalTaskType = 'READ' | 'STUDY' | 'PRACTICE' | 'REVIEW' | 'ADMIN';
type TacticalTask = { id: string; title: string; status: TacticalTaskStatus; type: TacticalTaskType; dueDate: Date };
import Link from 'next/link';
import { TaskGroupList } from './task-group-list';
import NextDynamic from 'next/dynamic';type TaskListItem = Pick<TacticalTask, 'id' | 'title' | 'status' | 'type' | 'dueDate'> & { module?: Pick<Module, 'id' | 'code' | 'title'> | null };

export default async function WeekViewPage({ searchParams }: { searchParams?: { date?: string; ui?: string } }) {
  const tasks: TaskListItem[] = [];
  const totalStudyMinutes = 0;

  const featureUIFlag = process.env.NEXT_PUBLIC_FEATURE_UI_LIBRARY === 'true' || searchParams?.ui === '1' || true; // Default to new UI

  return (
    <main className="min-h-screen">
      {featureUIFlag ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          <ClientWeekView date={searchParams?.date} />
        </div>
      ) : (
        <div className="container mx-auto py-8">
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <TaskGroupList tasks={tasks as TaskListItem[]} />
            </div>
            <aside className="space-y-3">
              <PerformanceGauge minutes={totalStudyMinutes} />
              <Link href="/dashboard" className="btn btn-secondary text-sm w-full justify-center">Back to Dashboard</Link>
            </aside>
          </div>
        </div>
      )}
    </main>
  );
}

const ClientWeekView = NextDynamic(() => import('./WeekView.container').then(m => m.WeekViewContainer), { ssr: false });

