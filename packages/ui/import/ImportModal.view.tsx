'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  ArrowUpDown, 
  Calendar, 
  Eye, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Plus
} from 'lucide-react';
import { Modal } from '../modals/Modal.view';
import { Card, CardHeader, CardBody } from '../layout/Card.view';
import { Button } from '../forms/Button.view';
import { Input, Select, SelectOption } from '../forms/Input.view';

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

type ImportType = 'modules' | 'assignments';
type ImportStep = 1 | 2 | 3 | 4 | 5;

interface ImportResult {
  preview?: { 
    valid?: unknown[]; 
    errors?: unknown[]; 
    duplicates?: Array<{ reason: string; duplicateKey: string }>;
    missingModules?: string[] 
  };
  successCount?: number;
  total?: number;
  failures?: Array<{ reason: string }>;
}

interface Term {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export function ImportModal({ isOpen, onClose, onComplete }: ImportModalProps) {
  const [step, setStep] = useState<ImportStep>(1);
  const [importType, setImportType] = useState<ImportType>('assignments'); // Default to assignments
  const [raw, setRaw] = useState<string>('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ImportResult | null>(null);
  const [missingModules, setMissingModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Term mapping state
  const [needsTermMapping, setNeedsTermMapping] = useState(false);
  const [modulesNeedingTerms, setModulesNeedingTerms] = useState<string[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);
  
  // Manual module creation state
  const [showManualCreate, setShowManualCreate] = useState(false);
  const [manualModule, setManualModule] = useState({
    code: '',
    title: '',
    creditHours: 12,
    targetMark: 75,
    department: ''
  });
  const [creatingModule, setCreatingModule] = useState(false);
  const [newTermDraft, setNewTermDraft] = useState<{ title: string; startDate: string; endDate: string }>({ 
    title: '', 
    startDate: '', 
    endDate: '' 
  });
  const [termMode, setTermMode] = useState<'existing' | 'create'>('existing');

  // Available field options for mapping - using camelCase to match API
  const fieldOptions: SelectOption[] = [
    { value: '', label: 'Select a field...' },
    // Module fields
    { value: 'code', label: 'Module Code' },
    { value: 'title', label: 'Title/Name' },
    { value: 'creditHours', label: 'Credit Hours' },
    { value: 'targetMark', label: 'Target Mark' },
    { value: 'department', label: 'Department' },
    { value: 'faculty', label: 'Faculty' },
    { value: 'prerequisites', label: 'Prerequisites' },
    // Assignment fields
    { value: 'moduleCode', label: 'Module Code' },
    { value: 'weight', label: 'Weight/Percentage' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'status', label: 'Status' },
    { value: 'type', label: 'Assignment Type' },
    { value: 'score', label: 'Grade/Score' },
    { value: 'effortEstimateMinutes', label: 'Effort Estimate (minutes)' },
    { value: 'component', label: 'Component' },
    { value: 'description', label: 'Description' },
    { value: 'ignore', label: '(Ignore this column)' }
  ];

  // Auto-detect import type based on CSV headers
  const detectImportType = (headers: string[]): ImportType => {
    const lowerHeaders = headers.map(h => h.toLowerCase());
    
    // Check for assignment-specific fields
    const hasAssignmentFields = lowerHeaders.some(h => 
      h.includes('due_date') || h.includes('grade') || h.includes('weight') || 
      h.includes('module_code') || h.includes('effort_estimate')
    );
    
    // Check for module-specific fields
    const hasModuleFields = lowerHeaders.some(h => 
      h.includes('credit') || h.includes('department') || h.includes('faculty') ||
      h.includes('prerequisite')
    );
    
    // If we find assignment-specific fields and no module-specific fields, it's likely assignments
    if (hasAssignmentFields && !hasModuleFields) {
      return 'assignments';
    }
    
    // If we find module-specific fields, it's likely modules
    if (hasModuleFields) {
      return 'modules';
    }
    
    // Default to assignments if unclear
    return 'assignments';
  };

  // Smart mapping suggestions based on header names - using camelCase to match API
  const getSmartMapping = (headers: string[]): Record<string, string> => {
    const smartMap: Record<string, string> = {};
    
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().replace(/[_\s-]/g, '');
      const originalLower = header.toLowerCase(); // Keep underscores for exact matching
      
      // Exact matches for common CSV headers
      if (originalLower === 'module_code') {
        smartMap[header] = 'moduleCode';
      } else if (originalLower === 'due_date') {
        smartMap[header] = 'dueDate';
      } else if (originalLower === 'effort_estimate') {
        smartMap[header] = 'effortEstimateMinutes';
      } else if (originalLower === 'grade') {
        smartMap[header] = 'score';
      // Generic matches
      } else if (lowerHeader === 'code' || lowerHeader.includes('coursecode')) {
        smartMap[header] = 'code'; // For modules
      } else if (lowerHeader.includes('title') || lowerHeader.includes('name')) {
        smartMap[header] = 'title';
      } else if (lowerHeader.includes('credit') && lowerHeader.includes('hour')) {
        smartMap[header] = 'creditHours';
      } else if (lowerHeader.includes('target') && lowerHeader.includes('mark')) {
        smartMap[header] = 'targetMark';
      } else if (lowerHeader.includes('department')) {
        smartMap[header] = 'department';
      } else if (lowerHeader.includes('faculty')) {
        smartMap[header] = 'faculty';
      } else if (lowerHeader.includes('prerequisite')) {
        smartMap[header] = 'prerequisites';
      } else if (lowerHeader.includes('type') || lowerHeader.includes('category')) {
        smartMap[header] = 'type';
      } else if (lowerHeader.includes('weight') || lowerHeader.includes('percent')) {
        smartMap[header] = 'weight';
      } else if (lowerHeader.includes('status')) {
        smartMap[header] = 'status';
      } else if (lowerHeader.includes('mark') || lowerHeader.includes('score')) {
        smartMap[header] = 'score';
      } else if (lowerHeader.includes('component')) {
        smartMap[header] = 'component';
      } else if (lowerHeader.includes('description') || lowerHeader.includes('desc')) {
        smartMap[header] = 'description';
      }
    });
    
    return smartMap;
  };

  const stepTitles = {
    1: 'Upload CSV File',
    2: 'Map Columns',
    3: 'Configure Terms',
    4: 'Preview & Validate',
    5: 'Import Complete'
  };

  const stepDescriptions = {
    1: 'Choose your import type and upload a CSV file',
    2: 'Map CSV columns to your data fields',
    3: 'Configure academic terms for modules',
    4: 'Review your data before importing',
    5: 'Import completed successfully'
  };

  const stepIcons = {
    1: Upload,
    2: ArrowUpDown,
    3: Calendar,
    4: Eye,
    5: CheckCircle
  };

  useEffect(() => {
    if (needsTermMapping) {
      loadTerms();
    }
  }, [needsTermMapping]);

  const loadTerms = async () => {
    try {
      const res = await fetch('/api/terms');
      const data = await res.json();
      setTerms(data.terms || []);
    } catch (error) {
      console.error('Failed to load terms:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const text = await file.text();
      const res = await fetch('/api/import/parse', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setHeaders(data.headers);
      setRaw(text);
      
      // Auto-detect import type based on headers
      const detectedType = detectImportType(data.headers);
      setImportType(detectedType);
      
      // Apply smart mapping
      const smartMapping = getSmartMapping(data.headers);
      setMapping(smartMapping);
      
      setStep(2);
    } catch (error) {
      console.error('Failed to parse file:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (needsTermMapping && selectedTermId) {
      setStep(4);
      return;
    }

    setLoading(true);
    try {
      const fieldMap = buildFieldMapping();
      const res = await fetch('/api/import/preview', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ importType, raw, mapping: fieldMap })
      });
      const data = await res.json();
      setResult(data);
      setMissingModules(data.preview?.missingModules ?? []);

      // Check if term mapping is needed for modules
      if (importType === 'modules') {
        const hasStart = Object.values(mapping).includes('startDate');
        const hasEnd = Object.values(mapping).includes('endDate');
        if (!hasStart || !hasEnd) {
          setNeedsTermMapping(true);
          const mods = (data.preview?.valid || []).map((v: { code?: string }) => v.code).filter(Boolean);
          setModulesNeedingTerms(mods);
          setStep(3);
          return;
        }
      }
      setStep(4);
    } catch (error) {
      console.error('Failed to preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    setLoading(true);
    try {
      const fieldMap = buildFieldMapping();
      const res = await fetch('/api/import/ingest', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ 
          importType, 
          raw, 
          mapping: fieldMap, 
          termId: selectedTermId 
        })
      });
      const data = await res.json();
      setResult(data);
      setStep(5);
    } catch (error) {
      console.error('Failed to import data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTerm = async () => {
    if (!newTermDraft.title || !newTermDraft.startDate || !newTermDraft.endDate) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(newTermDraft)
      });
      const data = await res.json();
      if (data.term) {
        setTerms([...terms, data.term]);
        setSelectedTermId(data.term.id);
      }
    } catch (error) {
      console.error('Failed to create term:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildFieldMapping = (): Record<string, string> => {
    const fieldToHeader: Record<string, string> = {};
    for (const [header, field] of Object.entries(mapping)) {
      if (!field || field === '__ignore__') continue;
      fieldToHeader[field] = header;
    }
    return fieldToHeader;
  };

  const canProceed = () => {
    switch (step) {
      case 1: return headers.length > 0;
      case 2: return Object.values(mapping).some(v => v && v !== '__ignore__');
      case 3: return !needsTermMapping || selectedTermId;
      case 4: return true;
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === 2) {
      handlePreview();
    } else if (step === 4) {
      handleImport();
    } else if (step < 5) {
      setStep((step + 1) as ImportStep);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep((step - 1) as ImportStep);
    }
  };

  const handleClose = () => {
    if (step === 5 && onComplete) {
      onComplete();
    }
    onClose();
  };

  // Manual module creation function
  const handleCreateModule = async () => {
    if (!manualModule.code.trim()) return;
    
    setCreatingModule(true);
    try {
      const response = await fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: manualModule.code.trim(),
          title: manualModule.title.trim() || manualModule.code.trim(),
          creditHours: Number(manualModule.creditHours) || 12,
          targetMark: manualModule.targetMark || null,
          department: manualModule.department.trim() || null,
          status: 'ACTIVE'
        })
      });
      
      //const result = await response.json();
      if (response.ok) {
        // Remove the created module from missing modules list
        setMissingModules(prev => prev.filter(code => code !== manualModule.code.trim()));
        
        // Reset the form
        setManualModule({
          code: '',
          title: '',
          creditHours: 12,
          targetMark: 75,
          department: ''
        });
        
        // If this was the last missing module, refresh the preview
        if (missingModules.length === 1) {
          handlePreview();
        }
      }
    } catch (error) {
      console.error('Failed to create module:', error);
    } finally {
      setCreatingModule(false);
    }
  };

  const importTypeOptions: SelectOption[] = [
    { value: 'modules', label: 'Modules' },
    { value: 'assignments', label: 'Assignments' }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Import Academic Data" 
      size="xl"
      showCloseButton={step !== 5}
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((s) => {
            const StepIcon = stepIcons[s as ImportStep];
            const isActive = s === step;
            const isCompleted = s < step;
            
            return (
              <div key={s} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-600 border-primary-600 text-white' 
                    : isCompleted 
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                {s < 5 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    s < step ? 'bg-green-600' : 'bg-slate-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Header */}
        <Card>
          <CardHeader gradient="primary">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {React.createElement(stepIcons[step], { className: "h-6 w-6 text-primary-600" })}
                <div>
                  <h3 className="text-lg font-bold text-primary-900">{stepTitles[step]}</h3>
                  <p className="text-sm text-primary-700">{stepDescriptions[step]}</p>
                </div>
              </div>
              <div className="bg-primary-200 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                Step {step} of 5
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <Card>
              <CardBody>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Import Type
                    </label>
                    <Select
                      value={importType}
                      onChange={(value: string) => setImportType(value as ImportType)}
                      options={importTypeOptions}
                      fullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      CSV File
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
                      <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <div className="text-lg font-medium text-slate-700 mb-2">
                        Drop your CSV file here or click to browse
                      </div>
                      <div className="text-sm text-slate-500 mb-4">
                        Supports CSV files up to 10MB
                      </div>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 cursor-pointer transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Choose File
                      </label>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {step === 2 && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-900">Column Mapping</h4>
                      <p className="text-sm text-slate-600">Map your CSV columns to data fields</p>
                    </div>
                    <Button
                      onClick={() => setMapping(getSmartMapping(headers))}
                      variant="secondary"
                      size="sm"
                    >
                      Auto-Map Columns
                    </Button>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="overflow-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">CSV Column</th>
                          <th className="px-6 py-3 text-left text-sm font-medium text-slate-700">Map to Field</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {headers.map((header) => (
                          <tr key={header} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                              {header}
                            </td>
                            <td className="px-6 py-4">
                              <Select
                                value={mapping[header] ?? ''}
                                onChange={(value: string) => setMapping({ ...mapping, [header]: value })}
                                options={fieldOptions}
                                fullWidth
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>

              {/* Mapping Preview */}
              {headers.length > 0 && (
                <Card>
                  <CardHeader gradient="blue">
                    <div>
                      <h4 className="font-semibold text-blue-900">Mapping Preview</h4>
                      <p className="text-sm text-blue-700">Preview how your columns will be mapped</p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Mapped Fields:</h5>
                        <div className="space-y-1">
                          {Object.entries(mapping).filter(([, value]) => value && value !== 'ignore').map(([header, field]) => (
                            <div key={header} className="flex items-center gap-2 text-sm">
                              <span className="bg-slate-100 px-2 py-1 rounded text-slate-700">{header}</span>
                              <ArrowRight className="h-3 w-3 text-slate-400" />
                              <span className="bg-blue-100 px-2 py-1 rounded text-blue-700">
                                {fieldOptions.find(opt => opt.value === field)?.label || field}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium text-slate-900 mb-2">Unmapped Columns:</h5>
                        <div className="space-y-1">
                          {headers.filter(header => !mapping[header] || mapping[header] === '').map(header => (
                            <div key={header} className="text-sm">
                              <span className="bg-orange-100 px-2 py-1 rounded text-orange-700">{header}</span>
                            </div>
                          ))}
                          {headers.filter(header => !mapping[header] || mapping[header] === '').length === 0 && (
                            <span className="text-sm text-green-600">All columns mapped!</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              )}
            </>
          )}

          {step === 3 && needsTermMapping && (
            <Card>
              <CardHeader gradient="orange">
                <div>
                  <h4 className="font-semibold text-orange-900">Term Configuration Required</h4>
                  <p className="text-sm text-orange-700">
                    The following modules need term dates: {modulesNeedingTerms.join(', ')}
                  </p>
                </div>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={termMode === 'existing'}
                        onChange={() => setTermMode('existing')}
                        className="rounded-full border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="font-medium text-slate-700">Use existing term</span>
                    </label>
                    
                    {termMode === 'existing' && (
                      <div className="ml-6">
                        <Select
                          value={selectedTermId || ''}
                          onChange={(value: string) => setSelectedTermId(value)}
                          options={[
                            { value: '', label: 'Select a term...' },
                            ...terms.map(t => ({ value: t.id, label: `${t.title} (${t.startDate} - ${t.endDate})` }))
                          ]}
                          fullWidth
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={termMode === 'create'}
                        onChange={() => setTermMode('create')}
                        className="rounded-full border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="font-medium text-slate-700">Create new term</span>
                    </label>
                    
                    {termMode === 'create' && (
                      <div className="ml-6 space-y-4">
                        <Input
                          label="Term Title"
                          value={newTermDraft.title}
                          onChange={(value: string) => setNewTermDraft({ ...newTermDraft, title: value })}
                          placeholder="e.g. Fall 2024"
                          fullWidth
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
                            <input
                              type="date"
                              value={newTermDraft.startDate}
                              onChange={(e) => setNewTermDraft({ ...newTermDraft, startDate: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
                            <input
                              type="date"
                              value={newTermDraft.endDate}
                              onChange={(e) => setNewTermDraft({ ...newTermDraft, endDate: e.target.value })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <Button
                          onClick={handleCreateTerm}
                          loading={loading}
                          variant="secondary"
                        >
                          <Plus className="h-4 w-4" />
                          Create Term
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {step === 4 && result && (
            <div className="space-y-4">
              {result.preview?.valid && result.preview.valid.length > 0 && (
                <Card>
                  <CardHeader gradient="green">
                    <div>
                      <h4 className="font-semibold text-green-900">Valid Records</h4>
                      <p className="text-sm text-green-700">
                        {result.preview.valid.length} records ready to import
                      </p>
                    </div>
                  </CardHeader>
                </Card>
              )}
              
              {result.preview?.errors && result.preview.errors.length > 0 && (
                <Card>
                  <CardHeader gradient="red">
                    <div>
                      <h4 className="font-semibold text-red-900">Import Errors</h4>
                      <p className="text-sm text-red-700">
                        {result.preview.errors.length} records have issues
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="max-h-32 overflow-y-auto">
                      {(result.preview.errors as { message?: string }[]).slice(0, 5).map((error, index) => (
                        <div key={index} className="text-sm text-red-600 mb-1">
                          • {error.message || JSON.stringify(error)}
                        </div>
                      ))}
                      {result.preview.errors.length > 5 && (
                        <div className="text-sm text-red-500">
                          ... and {result.preview.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}
              
              {result.preview?.duplicates && result.preview.duplicates.length > 0 && (
                <Card>
                  <CardHeader gradient="orange">
                    <div>
                      <h4 className="font-semibold text-orange-900">Duplicate Records</h4>
                      <p className="text-sm text-orange-700">
                        {result.preview.duplicates.length} records are duplicates
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <div className="max-h-32 overflow-y-auto">
                      {result.preview.duplicates.slice(0, 5).map((duplicate, index) => (
                        <div key={index} className="text-sm text-orange-600 mb-1">
                          • {duplicate.reason}
                        </div>
                      ))}
                      {result.preview.duplicates.length > 5 && (
                        <div className="text-sm text-orange-500">
                          ... and {result.preview.duplicates.length - 5} more duplicates
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              )}
              
              {missingModules.length > 0 && (
                <>
                  <Card>
                    <CardHeader gradient="orange">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-orange-900">Missing Modules</h4>
                          <p className="text-sm text-orange-700">
                            These modules need to be created first
                          </p>
                        </div>
                        <Button
                          onClick={() => setShowManualCreate(!showManualCreate)}
                          variant="secondary"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {showManualCreate ? 'Hide Form' : 'Create Manually'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {missingModules.map((moduleCode) => (
                          <span
                            key={moduleCode}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200"
                          >
                            {moduleCode}
                          </span>
                        ))}
                      </div>
                      
                      {showManualCreate && (
                        <div className="border-t border-orange-200 pt-4">
                          <h5 className="font-medium text-slate-900 mb-3">Create Module Manually</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Module Code *
                              </label>
                              <Input
                                value={manualModule.code}
                                onChange={(value) => setManualModule(prev => ({ ...prev, code: value }))}
                                placeholder="e.g. INF 164"
                                className="text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Module Title
                              </label>
                              <Input
                                value={manualModule.title}
                                onChange={(value) => setManualModule(prev => ({ ...prev, title: value }))}
                                placeholder="Optional - uses code if empty"
                                className="text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Credit Hours
                              </label>
                              <Input
                                type="number"
                                value={manualModule.creditHours.toString()}
                                onChange={(value) => setManualModule(prev => ({ ...prev, creditHours: parseInt(value) || 12 }))}
                                className="text-sm"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Target Mark (%)
                              </label>
                              <Input
                                type="number"
                                value={manualModule.targetMark.toString()}
                                onChange={(value) => setManualModule(prev => ({ ...prev, targetMark: parseInt(value) || 75 }))}
                                className="text-sm"
                              />
                            </div>
                            
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Department
                              </label>
                              <Input
                                value={manualModule.department}
                                onChange={(value) => setManualModule(prev => ({ ...prev, department: value }))}
                                placeholder="e.g. Computer Science, Statistics"
                                className="text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200">
                            <div className="text-sm text-slate-600">
                              💡 Tip: Fill in the module code from the missing list above
                            </div>
                            <Button
                              onClick={handleCreateModule}
                              disabled={!manualModule.code.trim() || creatingModule}
                              size="sm"
                            >
                              {creatingModule ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                                  Creating...
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4 mr-1" />
                                  Create Module
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </>
              )}
            </div>
          )}

          {step === 5 && result && (
            <Card>
              <CardHeader gradient="green">
                <div>
                  <h4 className="font-semibold text-green-900">Import Completed!</h4>
                  <p className="text-sm text-green-700">
                    Successfully imported {result.successCount} of {result.total} records
                  </p>
                </div>
              </CardHeader>
              {result.failures && result.failures.length > 0 && (
                <CardBody>
                  <div className="space-y-2">
                    <h5 className="font-medium text-slate-900">Import Issues:</h5>
                    <div className="max-h-32 overflow-y-auto">
                      {result.failures.map((failure, index) => (
                        <div key={index} className="text-sm text-red-600">
                          • {failure.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardBody>
              )}
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div>
            {step > 1 && step < 5 && (
              <Button
                onClick={handlePrevious}
                variant="secondary"
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {step < 5 && (
              <Button
                onClick={step === 5 ? handleClose : handleNext}
                variant="primary"
                disabled={!canProceed() || loading}
                loading={loading}
              >
                {step === 4 ? 'Import Data' : step === 5 ? 'Done' : 'Next'}
                {step < 4 && <ArrowRight className="h-4 w-4" />}
              </Button>
            )}
            
            {step === 5 && (
              <Button
                onClick={handleClose}
                variant="primary"
              >
                <CheckCircle className="h-4 w-4" />
                Done
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
