import dynamic from 'next/dynamic';
import React from 'react';

export default function ImportPage() {
  const ClientImporter = dynamic(() => import('./Importer.container').then(m => m.ImporterContainer), { ssr: false });
  return <ClientImporter />;
}

