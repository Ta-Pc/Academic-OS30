import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ModulesPage() {
  const modules = await prisma.module.findMany({
    orderBy: { code: 'asc' },
    select: { id: true, code: true, title: true, status: true },
  });

  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Modules</h1>
      <div className="grid gap-4">
        {modules.map((module) => (
          <Link
            key={module.id}
            href={`/modules/${module.id}`}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{module.code}</h3>
                  <p className="text-slate-600">{module.title}</p>
                </div>
                <span className={`badge ${module.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>
                  {module.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
