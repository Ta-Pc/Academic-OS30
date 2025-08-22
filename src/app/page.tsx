import Link from 'next/link';
import { redirect } from 'next/navigation';

export default function Home() {
  const featureUILibrary = process.env.NEXT_PUBLIC_FEATURE_UI_LIBRARY === 'true';
  const isProd = process.env.NODE_ENV === 'production';
  
  // If UI library feature is enabled, redirect to Academic OS
  if (featureUILibrary) {
    redirect('/dashboard');
  }

  if (isProd) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">Academic OS</h1>
        <p className="mt-4">Redirecting to login in production…</p>
        <Link href="/login" className="text-primary-700 underline">Go to Login</Link>
      </main>
    );
  }

  // Friendly onboarding page when feature flag is off
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Academic OS</h1>
        <p className="text-gray-600 mb-8">
          Your complete academic management system with weekly planning, 
          strategic analytics, and module tracking all integrated into one experience.
        </p>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Launch Academic OS
        </Link>
        <div className="mt-6 space-x-4">
          <Link href="/dashboard?view=weekly" className="text-blue-600 hover:text-blue-700 underline text-sm">
            Weekly View
          </Link>
          <Link href="/modules" className="text-blue-600 hover:text-blue-700 underline text-sm">
            Modules
          </Link>
        </div>
      </div>
    </main>
  );
}

