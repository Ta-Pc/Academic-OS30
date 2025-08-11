'use client';

import React, { useState, useEffect } from 'react';
import { ImportModal } from '@ui/import/ImportModal.view';
import { Button } from '@ui/forms/Button.view';
import { PageHeaderView } from '@ui/layout/PageHeader.view';
import { Card, CardHeader, CardBody } from '@ui/layout/Card.view';
import { FileText, Upload, Database } from 'lucide-react';
import { pushModal, closeModal, listenModal } from '@/lib/modal-history';

export function ImportPageContainer() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Listen for modal state changes from URL
    const unsubscribe = listenModal((state) => {
      setShowModal(state?.modal === 'import');
    });

    // Check initial state
    const url = new URL(window.location.toString());
    setShowModal(url.searchParams.get('modal') === 'import');

    return unsubscribe;
  }, []);

  const handleOpenModal = () => {
    pushModal('import');
  };

  const handleCloseModal = () => {
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeaderView 
        title="Data Import"
        subtitle="Import your academic data from CSV files"
        icon={<Database className="h-8 w-8" />}
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Import Overview Card */}
          <Card hover>
            <CardHeader gradient="primary">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-primary-600" />
                <div>
                  <h3 className="text-lg font-bold text-primary-900">CSV Data Import</h3>
                  <p className="text-sm text-primary-700">
                    Import modules, assignments, and academic data from CSV files
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <p className="text-slate-600">
                  Use our guided import process to upload and map your CSV data to the Academic OS structure. 
                  The system supports importing modules, assignments, and student data with automatic validation.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Supported Data Types</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Academic modules and courses</li>
                      <li>• Assignments and assessments</li>
                      <li>• Student enrollments</li>
                      <li>• Grade and marking data</li>
                    </ul>
                  </div>
                  
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Features</h4>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Column mapping and validation</li>
                      <li>• Data preview and error checking</li>
                      <li>• Term configuration</li>
                      <li>• Batch processing</li>
                    </ul>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleOpenModal}
                    size="lg"
                    className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    Start Import Process
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Import Instructions */}
          <Card>
            <CardHeader gradient="blue">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900">Import Instructions</h3>
                  <p className="text-sm text-blue-700">
                    Follow these steps for a successful import
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Before You Start</h4>
                    <ol className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium min-w-[20px] text-center">1</span>
                        Prepare your CSV file with proper headers
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium min-w-[20px] text-center">2</span>
                        Ensure data is clean and consistent
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium min-w-[20px] text-center">3</span>
                        Have academic term dates ready
                      </li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-3">Import Process</h4>
                    <ol className="text-sm text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium min-w-[20px] text-center">1</span>
                        Upload your CSV file
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium min-w-[20px] text-center">2</span>
                        Map columns to database fields
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium min-w-[20px] text-center">3</span>
                        Configure terms and validate data
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium min-w-[20px] text-center">4</span>
                        Review and complete import
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Import Modal */}
      {showModal && (
        <ImportModal
          isOpen={showModal}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
