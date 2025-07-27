"use client";

// Skeleton loading components for better UX

export function SkeletonCard({ className = "" }) {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse ${className}`}>
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-slate-300 rounded-lg mr-4"></div>
        <div className="flex-1">
          <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-slate-300 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-300 rounded w-full"></div>
        <div className="h-3 bg-slate-300 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 6 }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 bg-slate-300 rounded w-1/3 animate-pulse"></div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-3">
                  <div className="h-4 bg-slate-300 rounded animate-pulse"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-slate-300 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SkeletonForm() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 animate-pulse">
      <div className="h-6 bg-slate-300 rounded w-1/3 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-slate-300 rounded w-1/4 mb-1"></div>
            <div className="h-10 bg-slate-300 rounded w-full"></div>
          </div>
        ))}
        <div className="md:col-span-2">
          <div className="h-10 bg-blue-300 rounded w-full"></div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-slate-300 rounded-lg mr-4"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-300 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-slate-300 rounded w-1/2 mb-1"></div>
              <div className="h-3 bg-slate-300 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonMachine() {
  return (
    <div className="bg-white p-6 rounded-lg shadow animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-slate-300 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-slate-300 rounded w-1/4"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-16 bg-slate-300 rounded"></div>
          <div className="h-8 w-16 bg-slate-300 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-slate-50 p-3 rounded">
            <div className="h-3 bg-slate-300 rounded mb-1"></div>
            <div className="h-6 bg-slate-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="h-5 bg-slate-300 rounded w-1/4 mb-3"></div>
        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-16 gap-2">
          {Array.from({ length: 32 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-300 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonEarnings() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex justify-between items-center">
        <div className="h-8 bg-slate-300 rounded w-1/3 animate-pulse"></div>
        <div className="flex gap-4">
          <div className="h-10 w-32 bg-slate-300 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-300 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-300 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Stats cards */}
      <SkeletonStats />

      {/* Charts/Tables area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export function SkeletonSearch() {
  return (
    <div className="space-y-6">
      {/* Search form skeleton */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 bg-slate-300 rounded w-1/4 mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="h-4 bg-slate-300 rounded w-1/3 mb-1"></div>
            <div className="h-10 bg-slate-300 rounded w-full"></div>
          </div>
          <div>
            <div className="h-4 bg-slate-300 rounded w-1/2 mb-1"></div>
            <div className="h-10 bg-slate-300 rounded w-full"></div>
          </div>
          <div className="flex items-end">
            <div className="h-10 bg-blue-300 rounded w-full"></div>
          </div>
        </div>
      </div>

      {/* Results skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}
