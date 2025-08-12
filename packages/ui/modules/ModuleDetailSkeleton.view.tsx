import React from 'react';

export function ModuleDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-20"></div>
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="h-4 bg-slate-200 rounded w-32"></div>
        </div>
        <div className="h-9 bg-slate-200 rounded w-24"></div>
      </div>

      {/* Quick Actions Skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 bg-slate-200 rounded w-28"></div>
        ))}
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="h-3 bg-slate-200 rounded w-16 mb-2"></div>
            <div className="h-8 bg-slate-200 rounded w-12 mb-1"></div>
            <div className="h-3 bg-slate-200 rounded w-20"></div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 bg-slate-200 rounded w-20"></div>
                <div className="flex-1 h-2 bg-slate-200 rounded"></div>
                <div className="h-4 bg-slate-200 rounded w-4"></div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="h-6 bg-slate-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-3 h-3 bg-slate-200 rounded-full mt-1"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Assignments Skeleton */}
      <div className="space-y-4">
        <div className="h-6 bg-slate-200 rounded w-32"></div>
        <div className="bg-white rounded-2xl border border-slate-200">
          <div className="p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left pb-2">
                      <div className="h-4 bg-slate-200 rounded w-16"></div>
                    </th>
                    <th className="text-right pb-2">
                      <div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div>
                    </th>
                    <th className="text-right pb-2">
                      <div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div>
                    </th>
                    <th className="text-right pb-2">
                      <div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div>
                    </th>
                    <th className="text-center pb-2">
                      <div className="h-4 bg-slate-200 rounded w-12 mx-auto"></div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td className="py-2">
                        <div className="h-4 bg-slate-200 rounded w-32"></div>
                      </td>
                      <td className="py-2 text-right">
                        <div className="h-4 bg-slate-200 rounded w-8 ml-auto"></div>
                      </td>
                      <td className="py-2 text-right">
                        <div className="h-4 bg-slate-200 rounded w-8 ml-auto"></div>
                      </td>
                      <td className="py-2 text-right">
                        <div className="h-4 bg-slate-200 rounded w-12 ml-auto"></div>
                      </td>
                      <td className="py-2 text-center">
                        <div className="h-6 bg-slate-200 rounded w-12 mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
