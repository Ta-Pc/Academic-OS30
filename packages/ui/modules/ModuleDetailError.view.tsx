import React from 'react';
import { Card, CardBody } from '../layout/Card.view';
import { Button } from '../forms/Button.view';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export interface ModuleDetailErrorProps {
  error: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

export function ModuleDetailError({ error, onRetry, onGoBack }: ModuleDetailErrorProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Card className="max-w-md">
        <CardBody className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-slate-900 mb-2">
            Failed to load module details
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            {onRetry && (
              <Button variant="primary" size="sm" onClick={onRetry}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            {onGoBack && (
              <Button variant="secondary" size="sm" onClick={onGoBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
