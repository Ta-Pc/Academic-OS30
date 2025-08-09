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
      maxScore: number | null;
      weight: number;
      contribution: number | null;
    }>;
  };
};

import { getBaseUrl } from '@/lib/base-url';
import { prisma as prismaClient } from '@/lib/prisma';

async function fetchAnalytics(moduleId: string): Promise<AnalyticsResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/modules/${moduleId}/analytics`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

// Assignments are provided by analytics endpoint with derived fields

export default async function ModuleDetailPage({ params }: { params: { moduleId: string } }) {
  const { moduleId } = params;
  // Guard: ensure module belongs to current mock user for SSR fetches reliant on DB
  const mod = await prismaClient.module.findUnique({ where: { id: moduleId }, select: { id: true } });
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
        <Link className="btn btn-secondary" href="/dashboard">Back to Dashboard</Link>
      </div>

      {process.env.NEXT_PUBLIC_FEATURE_UI_LIBRARY === 'true' ? (
        // @ts-expect-error client boundary
        <ClientModuleDetail moduleId={moduleId} initial={a} />
      ) : (
        <ClientAnalytics moduleId={moduleId} initial={a} />
      )}
    </main>
  );
}

const ClientModuleDetail = NextDynamic(() => import('./ModuleDetail.container').then(m => m.ModuleDetailContainer), { ssr: false });

