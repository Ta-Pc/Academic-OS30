import Link from 'next/link';

export default function Home() {
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Academic OS</h1>
        <p className="mt-4">Redirecting to login in production…</p>
        <Link href="/login" className="text-primary-700 underline">Go to Login</Link>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Academic OS (Dev)</h1>
      <p className="mt-4">Open the Weekly View to see seeded data.</p>
      <div className="space-x-4 mt-2">
        <Link href="/week-view" className="text-primary-700 underline">Open Weekly View</Link>
        <Link href="/dashboard" className="text-primary-700 underline">Open Strategic Dashboard</Link>
      </div>
    </main>
  );
}

