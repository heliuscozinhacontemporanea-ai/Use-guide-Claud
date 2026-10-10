import React from 'react';
import { cn } from '../../../../shared/utils/cn';

interface StepNavigationProps {
  category: string;
  currentStep: number;
}

export function StepNavigation({ category, currentStep }: StepNavigationProps) {
  const steps = category === 'event' ? [1, 2, 5] : [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1.5 mt-1" id="step-navigation-indicators">
      {steps.map((step, idx) => {
        const isActive = currentStep === step;
        const isCompleted =
          category === 'event' ? steps.indexOf(currentStep) > idx : currentStep > step;

        return (
          <div
            key={step}
            className={cn(
              'h-1 rounded-full transition-all duration-300',
              isActive
                ? 'w-6 bg-indigo-500'
                : isCompleted
                  ? 'w-3 bg-indigo-500/40'
                  : 'w-1.5 bg-white/10'
            )}
            id={`step-indicator-${step}`}
          />
        );
      })}
    </div>
  );
}
