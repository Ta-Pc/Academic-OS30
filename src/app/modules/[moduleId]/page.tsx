import Link from 'next/link';
import ClientAnalytics from './ui-client-analytics';
import NextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

type AnalyticsResponse = {
  data: {
    module: { id: string; code: string; title: string; targetMark: number | null };
    totalWeightAssessed: number;
    currentObtainedMark: number;
    currentAverageMark: number;
    remainingWeight: number;
    requiredAveOnRemaining: number;
    currentPredictedSemesterMark: number;
    assignments: Array<{
      id: string;
      title: string;
      dueDate: string | null;
      score: number | null;
      weight: number;
      contribution: number | null;
    }>;
  };
};

import { getBaseUrl } from '@/lib/base-url';
import { prisma as prismaClient } from '@/lib/prisma';

async function fetchAnalytics(moduleId: string): Promise<AnalyticsResponse> {
  const base = getBaseUrl();
  const url = `${base}/api/modules/${moduleId}/analytics`;
  console.log('Fetching analytics from:', url);
  
  const res = await fetch(url, { 
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  
  if (!res.ok) {
    console.error('Analytics fetch failed:', res.status, res.statusText);
    throw new Error(`Failed to fetch analytics: ${res.status} ${res.statusText}`);
  }
  
  const data = await res.json();
  console.log('Analytics data received:', data);
  return data;
}

// Assignments are provided by analytics endpoint with derived fields

export default async function ModuleDetailPage({ params }: { params: { moduleId: string } }) {
  const { moduleId } = params;
  
  // Support lookup by both id (CUID) and code (like STK110)
  const isCuid = /^c[a-z0-9]{24,}$/i.test(moduleId);
  const whereClause = isCuid ? { id: moduleId } : { code: moduleId };
  
  // Guard: ensure module exists
  const moduleExists = await prismaClient.module.findFirst({ where: whereClause, select: { id: true } });
  if (!moduleExists) {
    throw new Error(`Module ${moduleId} not found`);
  }
  
  const [analytics] = await Promise.all([
    fetchAnalytics(moduleId),
  ]);

  const a = analytics.data;

  return (
    <main className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">
          {a.module.code} — {a.module.title}
        </h1>
        <div className="flex gap-2">
          <Link className="btn btn-secondary" href="/dashboard">Back to Dashboard</Link>
        </div>
      </div>

      {process.env.NEXT_PUBLIC_FEATURE_UI_LIBRARY === 'true' ? (
        <ClientModuleDetail moduleId={moduleId} initial={a} />
      ) : (
        <ClientAnalytics moduleId={moduleId} initial={a} />
      )}
    </main>
  );
}

const ClientModuleDetail = NextDynamic(() => import('./ModuleDetail.container').then(m => m.ModuleDetailContainer), { ssr: false });

