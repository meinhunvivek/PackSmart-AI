import React from 'react';
import { Check } from 'lucide-react';
import { Language, DICTIONARY } from '../data/i18n';

interface StepperProps {
  currentStep: number;
  setStep: (step: number) => void;
  language: Language;
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, setStep, language }) => {
  const t = DICTIONARY[language];

  const steps = [
    { num: 1, title: t.step1, desc: language === 'en' ? 'Commodity & Physical Specs' : 'खाद्य वस्तु व गुण' },
    { num: 2, title: t.step2, desc: language === 'en' ? 'Target Life & Environment' : 'शेल्फ लाइफ व भंडारण' },
    { num: 3, title: t.step3, desc: language === 'en' ? 'Review & Verification' : 'समीक्षा व गणना' },
  ];

  return (
    <div className="w-full mb-8">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {steps.map((step) => {
          const isDone = currentStep > step.num;
          const isActive = currentStep === step.num;

          return (
            <button
              key={step.num}
              onClick={() => {
                if (step.num < currentStep) setStep(step.num);
              }}
              className={`text-left p-3 sm:p-4 rounded-xl border transition-all relative ${
                isActive
                  ? 'bg-emerald-50/80 border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                  : isDone
                  ? 'bg-white border-emerald-200 hover:bg-emerald-50/30 cursor-pointer'
                  : 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isActive
                      ? 'bg-emerald-700 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : step.num}
                </div>
                <div className="min-w-0">
                  <div
                    className={`text-xs sm:text-sm font-bold truncate ${
                      isActive ? 'text-emerald-950' : isDone ? 'text-stone-800' : 'text-stone-500'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-[11px] text-stone-500 hidden sm:block truncate">
                    {step.desc}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
