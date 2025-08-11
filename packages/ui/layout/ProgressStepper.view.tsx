import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: string | number;
  title: string;
  description?: string;
}

export interface ProgressStepperProps {
  steps: Step[];
  currentStep: string | number;
  completedSteps?: (string | number)[];
  className?: string;
}

export function ProgressStepper({ 
  steps, 
  currentStep, 
  completedSteps = [],
  className = '' 
}: ProgressStepperProps) {
  const getCurrentStepIndex = () => steps.findIndex(step => step.id === currentStep);
  const currentIndex = getCurrentStepIndex();

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isUpcoming = index > currentIndex;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center relative">
                {/* Step Circle */}
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500 text-white shadow-lg' 
                    : isCurrent 
                      ? 'bg-primary-600 text-white shadow-lg ring-4 ring-primary-100' 
                      : isUpcoming
                        ? 'bg-slate-200 text-slate-500'
                        : 'bg-slate-300 text-slate-600'
                  }
                `}>
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                
                {/* Step Content */}
                <div className="mt-3 text-center max-w-[120px]">
                  <div className={`text-sm font-medium transition-colors duration-300 ${
                    isCurrent ? 'text-primary-700' : 'text-slate-700'
                  }`}>
                    {step.title}
                  </div>
                  {step.description && (
                    <div className="text-xs text-slate-500 mt-1">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 mt-5 relative">
                  <div className="absolute inset-0 bg-slate-200 rounded-full" />
                  <div 
                    className={`absolute inset-0 bg-gradient-to-r from-primary-500 to-green-500 rounded-full transition-all duration-500 ${
                      index < currentIndex ? 'w-full' : 'w-0'
                    }`} 
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
