type Step = 'zip' | 'reps' | 'issue' | 'position' | 'generate';

interface ProgressStepperProps {
  currentStep: Step;
}

const STEP_INFO: Record<Step, { number: number; label: string }> = {
  zip: { number: 1, label: 'Find Your Representatives' },
  reps: { number: 2, label: 'Select the Representative you wish to contact' },
  issue: { number: 3, label: 'Choose an Issue' },
  position: { number: 4, label: 'Your Position' },
  generate: { number: 5, label: 'Personalize & Generate' },
};

export default function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const { number, label } = STEP_INFO[currentStep];

  return (
    <div className="mb-8 text-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors ${step === number
                ? 'bg-blue-500'
                : step < number
                  ? 'bg-blue-700'
                  : 'bg-slate-700'
                }`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-slate-400">
        Step {number} of 5 — {label}
      </p>
    </div>
  );
}
