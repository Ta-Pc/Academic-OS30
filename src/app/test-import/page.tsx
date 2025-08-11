'use client';

import React, { useState } from 'react';
import { ImportModal } from '@ui/import/ImportModal.view';
import { Button } from '@ui/forms/Button.view';

export default function TestImportModalPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Test Import Modal</h1>
        <Button
          onClick={() => setShowModal(true)}
          variant="primary"
          size="lg"
        >
          Open Import Modal
        </Button>
        
        {showModal && (
          <ImportModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}
