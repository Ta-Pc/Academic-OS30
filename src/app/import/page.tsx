import dynamic from 'next/dynamic';
import React from 'react';

type ImportType = 'modules' | 'assignments';

const IGNORE = '__ignore__';

export default function ImportPage() {
  if (process.env.NEXT_PUBLIC_FEATURE_UI_LIBRARY === 'true') {
    const ClientImporter = dynamic(() => import('./Importer.container').then(m => m.ImporterContainer), { ssr: false });
    // @ts-expect-error server boundary
    return <ClientImporter />;
  }
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-2xl font-semibold">Importer (legacy)</h1>
      <p className="text-slate-600">Enable NEXT_PUBLIC_FEATURE_UI_LIBRARY to try the new Importer.</p>
    </main>
  );
}

