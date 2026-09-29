interface Step {
  label: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number; // 1-based
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-start justify-center">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const isComplete = stepNum < currentStep;
        const isActive = stepNum === currentStep;
        return (
          <div key={i} className="flex items-start">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                  isComplete
                    ? "bg-indigo-accent text-white"
                    : isActive
                      ? "bg-indigo-accent text-white shadow-md"
                      : "border-2 border-gray-300 bg-white text-text-muted"
                }`}
              >
                {isComplete ? "✓" : stepNum}
              </div>
              <span
                className={`mt-1.5 whitespace-nowrap text-xs font-medium ${
                  isActive ? "text-indigo-accent" : "text-text-muted"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mt-4 h-0.5 w-20 ${
                  stepNum < currentStep ? "bg-indigo-accent" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
