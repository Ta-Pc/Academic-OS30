import dynamic from 'next/dynamic';
import React from 'react';

export default function ImportPage() {
  const ClientImportPage = dynamic(() => import('./ImportPage.container').then(m => m.ImportPageContainer), { ssr: false });
  return <ClientImportPage />;
}

