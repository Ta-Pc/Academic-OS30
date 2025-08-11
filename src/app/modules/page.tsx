import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function ModulesPage() {
  const modules = await prisma.module.findMany({
    orderBy: { code: 'asc' },
    include: {
      assignments: {
        select: {
          id: true,
          score: true,
          weight: true,
          status: true,
        }
      }
    }
  });

  // Calculate module statistics
  const modulesWithStats = modules.map(module => {
    const assignments = module.assignments || [];
    const totalWeight = assignments.reduce((sum: number, a) => sum + (a.weight || 0), 0);
    const completedAssignments = assignments.filter((a) => a.status === 'GRADED' && a.score !== null);
    const averageScore = completedAssignments.length > 0 
      ? completedAssignments.reduce((sum: number, a) => sum + (a.score || 0), 0) / completedAssignments.length 
      : 0;
    const completionRate = assignments.length > 0 ? (completedAssignments.length / assignments.length) * 100 : 0;
    
    return {
      ...module,
      stats: {
        totalAssignments: assignments.length,
        completedAssignments: completedAssignments.length,
        averageScore: Math.round(averageScore * 10) / 10,
        completionRate: Math.round(completionRate),
        totalWeight,
      }
    };
  });

  const activeModules = modulesWithStats.filter(m => m.status === 'ACTIVE');
  const inactiveModules = modulesWithStats.filter(m => m.status !== 'ACTIVE');

  return (
    <div className="page-container">
      <div className="page-content p-6 sm:p-8">
        {/* Header Section */}
        <div className="cohesive-section mb-8">
          <div className="section-header section-header-blue">
            <div className="flex items-center space-x-3">
              <div className="section-icon-lg section-icon-blue">
                <span className="text-3xl">📚</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">Academic Modules</h1>
                <p className="text-base text-blue-700">Comprehensive overview of your course portfolio</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-blue-800">
              <div className="tag tag-blue">
                {activeModules.length} Active
              </div>
              {inactiveModules.length > 0 && (
                <div className="tag tag-blue bg-blue-200">
                  {inactiveModules.length} Inactive
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="cohesive-section mb-8">
          <div className="section-header section-header-emerald">
            <div className="flex items-center space-x-3">
              <div className="section-icon section-icon-emerald">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-emerald-900">Portfolio Overview</h2>
                <p className="text-sm text-emerald-700">Key performance metrics</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="metric-card metric-card-emerald">
                <div className="flex items-center justify-between mb-3">
                  <div className="tag tag-emerald">TOTAL MODULES</div>
                  <div className="text-2xl font-bold text-slate-900">{activeModules.length}</div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="status-dot status-dot-green"></span>
                    Currently active
                  </span>
                  <span className="interactive-link interactive-link-emerald">View all →</span>
                </div>
              </div>

              <div className="metric-card metric-card-blue">
                <div className="flex items-center justify-between mb-3">
                  <div className="tag tag-blue">AVG COMPLETION</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {Math.round(activeModules.reduce((sum, m) => sum + m.stats.completionRate, 0) / (activeModules.length || 1))}%
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="status-dot status-dot-blue"></span>
                    Assignment progress
                  </span>
                  <span className="interactive-link interactive-link-blue">Details →</span>
                </div>
              </div>

              <div className="metric-card metric-card-purple">
                <div className="flex items-center justify-between mb-3">
                  <div className="tag tag-purple">TOTAL CREDITS</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {activeModules.reduce((sum, m) => sum + (m.creditHours || 0), 0)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="status-dot status-dot-blue"></span>
                    Credit hours
                  </span>
                  <span className="interactive-link interactive-link-purple">Breakdown →</span>
                </div>
              </div>

              <div className="metric-card metric-card-orange">
                <div className="flex items-center justify-between mb-3">
                  <div className="tag tag-orange">ASSIGNMENTS</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {activeModules.reduce((sum, m) => sum + m.stats.totalAssignments, 0)}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="status-dot status-dot-yellow"></span>
                    Total assessments
                  </span>
                  <span className="interactive-link interactive-link-orange">View →</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Active Modules Grid */}
        <div className="cohesive-section mb-8">
          <div className="section-header section-header-indigo">
            <div className="flex items-center space-x-3">
              <div className="section-icon section-icon-indigo">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-indigo-900">Active Modules</h2>
                <p className="text-sm text-indigo-700">Current semester courses</p>
              </div>
            </div>
            <div className="tag tag-indigo">{activeModules.length} modules</div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeModules.map((module) => (
                <Link
                  key={module.id}
                  href={`/modules/${module.id}`}
                  className="block group"
                >
                  <div className="metric-card metric-card-indigo group-hover:scale-[1.02] transition-transform duration-200">
                    <div className="space-y-4">
                      {/* Module Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="tag tag-indigo mb-2">{module.code}</div>
                          <h3 className="font-semibold text-slate-900 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                            {module.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">{module.creditHours} credit hours</p>
                        </div>
                        <div className="text-right">
                          <div className={`status-dot ml-2 ${module.status === 'ACTIVE' ? 'status-dot-green' : 'status-dot-yellow'}`}></div>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Assignment Progress</span>
                            <span>{module.stats.completionRate}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                module.stats.completionRate >= 80 ? 'bg-green-500' : 
                                module.stats.completionRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${module.stats.completionRate}%` }}
                            ></div>
                          </div>
                        </div>

                        {module.stats.averageScore > 0 && (
                          <div>
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                              <span>Average Score</span>
                              <span>{module.stats.averageScore}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  module.stats.averageScore >= 75 ? 'bg-green-500' : 
                                  module.stats.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${Math.min(100, module.stats.averageScore)}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Module Stats */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500">
                          {module.stats.completedAssignments}/{module.stats.totalAssignments} assignments
                        </div>
                        <div className="flex items-center gap-2">
                          {module.stats.averageScore >= 75 && (
                            <span className="text-green-500 text-xs">🌟</span>
                          )}
                          <span className="interactive-link interactive-link-indigo text-xs">
                            View details →
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {/* Add Module Card */}
              <Link href="/modules/new" className="block group">
                <div className="metric-card border-2 border-dashed border-slate-300 group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-all duration-200">
                  <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">➕</div>
                    <h3 className="font-semibold text-slate-700 group-hover:text-indigo-700">Add New Module</h3>
                    <p className="text-xs text-slate-500 mt-1">Create a new course</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Inactive Modules Section */}
        {inactiveModules.length > 0 && (
          <div className="cohesive-section">
            <div className="section-header section-header-orange">
              <div className="flex items-center space-x-3">
                <div className="section-icon section-icon-orange">
                  <span className="text-xl">📋</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-orange-900">Archived Modules</h2>
                  <p className="text-sm text-orange-700">Previously completed courses</p>
                </div>
              </div>
              <div className="tag tag-orange">{inactiveModules.length} modules</div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {inactiveModules.map((module) => (
                  <Link
                    key={module.id}
                    href={`/modules/${module.id}`}
                    className="block group"
                  >
                    <div className="metric-card metric-card-orange opacity-75 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="tag tag-orange text-xs">{module.code}</div>
                          <div className="status-dot status-dot-yellow"></div>
                        </div>
                        <h3 className="font-medium text-slate-900 text-sm line-clamp-2">
                          {module.title}
                        </h3>
                        <div className="text-xs text-slate-500">
                          {module.creditHours} credits • {module.status}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
