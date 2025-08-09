import ModuleCard from '@/components/ModuleCard';
import { getBaseUrl } from '@/lib/base-url';
import { prisma } from '@/lib/prisma';

type DashboardResponse = {
  data: Array<{
    id: string;
    code: string;
    title: string;
    creditHours: number;
    createdAt: string;
    currentGrade: number;
    currentAverageMark: number;
  }>;
  widgets: {
    urgent: {
      lateAssignments: Array<{ id: string; title: string; dueDate: string; module: { id: string; code: string; title: string } }>;
      upcomingAssignments: Array<{ id: string; title: string; dueDate: string; module: { id: string; code: string; title: string } }>;
      strugglingModules: Array<{ id: string; code: string; title: string; currentAverageMark: number }>;
    };
    metrics: {
      overallWeightedAverage: number;
      tasks: { completed: number; pending: number };
    };
  };
};

async function fetchDashboard(userId: string): Promise<DashboardResponse> {
  const base = getBaseUrl();
  const url = new URL(`${base}/api/dashboard`);
  url.searchParams.set('userId', userId);
  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

function StatTile({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: 'default' | 'good' | 'warn' | 'bad' }) {
  const toneClass =
    tone === 'good' ? 'bg-success-50 text-success-900 ring-success-200' :
    tone === 'warn' ? 'bg-warning-50 text-warning-900 ring-warning-200' :
    tone === 'bad' ? 'bg-danger-50 text-danger-900 ring-danger-200' :
    'bg-white text-slate-900 ring-slate-200';
  return (
    <div className={`card ring-1 ring-inset ${toneClass}`}>
      <div className="card-body">
        <div className="text-sm text-slate-600">{label}</div>
        <div className="mt-1 text-3xl font-semibold">{value}</div>
        {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
      </div>
    </div>
  );
}

function UrgentList({ title, items }: { title: string; items: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="text-sm font-semibold text-slate-700">{title}</div>
      </div>
      <div className="card-body">
        <div className="space-y-3">{items}</div>
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  let resp: DashboardResponse | null = null;
  const userId = (await prisma.user.findFirst({ select: { id: true } }))?.id || '';
  if (userId) {
    try {
      resp = await fetchDashboard(userId);
    } catch {}
  }

  const modules = resp?.data ?? [];
  const urgent = resp?.widgets?.urgent;
  const metrics = resp?.widgets?.metrics;

  return (
    <main className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Academic Command Center</h1>
        <p className="text-slate-600 mt-1">A strategic overview of your modules, deadlines, and progress.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatTile
              label="Overall Weighted Average"
              value={`${Math.round((metrics?.overallWeightedAverage ?? 0) * 10) / 10}%`}
              hint="Across all active modules"
              tone={(metrics?.overallWeightedAverage ?? 0) >= 70 ? 'good' : (metrics?.overallWeightedAverage ?? 0) >= 50 ? 'default' : 'bad'}
            />
            <StatTile
              label="Tasks Completed"
              value={String(metrics?.tasks.completed ?? 0)}
              hint={`Pending: ${metrics?.tasks.pending ?? 0}`}
              tone="good"
            />
          </div>

          <div className="card">
            <div className="card-header">
              <div className="text-sm font-semibold text-slate-700">Your Modules</div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {modules.map((m) => (
                  <ModuleCard key={m.id} module={m} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card ring-1 ring-inset ring-danger-200">
            <div className="card-header">
              <div className="flex items-center gap-2">
                <span className="badge badge-danger">Urgent</span>
                <span className="text-sm font-semibold text-slate-700">Attention Required</span>
              </div>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <UrgentList
                  title="Overdue Assignments"
                  items={(urgent?.lateAssignments?.length ?? 0) > 0 ? (
                    urgent!.lateAssignments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{a.title}</div>
                          <div className="text-xs text-slate-500 truncate">{a.module.code} — due {new Date(a.dueDate).toLocaleString()}</div>
                        </div>
                        <span className="badge badge-danger">LATE</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">No overdue assignments. Great work!</div>
                  )}
                />
                <UrgentList
                  title="Due in 3 Days"
                  items={(urgent?.upcomingAssignments?.length ?? 0) > 0 ? (
                    urgent!.upcomingAssignments.map((a) => (
                      <div key={a.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{a.title}</div>
                          <div className="text-xs text-slate-500 truncate">{a.module.code} — due {new Date(a.dueDate).toLocaleString()}</div>
                        </div>
                        <span className="badge badge-warning">DUE</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">No upcoming deadlines within 3 days.</div>
                  )}
                />
                <UrgentList
                  title="At-Risk Modules (<50%)"
                  items={(urgent?.strugglingModules?.length ?? 0) > 0 ? (
                    urgent!.strugglingModules.map((m) => (
                      <div key={m.id} className="flex items-center justify-between">
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{m.code} — {m.title}</div>
                          <div className="text-xs text-slate-500">Avg {Math.round(m.currentAverageMark)}%</div>
                        </div>
                        <span className="badge badge-danger">RISK</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-slate-500">No modules currently under 50% average.</div>
                  )}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

