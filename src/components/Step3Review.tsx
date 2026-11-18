import React from 'react';
import { ArrowLeft, CheckCircle, Sparkles, Scale, Box, ShieldCheck, Sun, Wind, Thermometer, Calendar } from 'lucide-react';
import { InputState } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';

interface Step3Props {
  inputs: InputState;
  onSubmit: () => void;
  onBack: () => void;
  language: Language;
}

export const Step3Review: React.FC<Step3Props> = ({
  inputs,
  onSubmit,
  onBack,
  language,
}) => {
  const t = DICTIONARY[language];
  const estimatedAreaM2 = Math.max(0.005, 0.0004 * Math.pow(Math.max(5, inputs.packWeightG), 0.7));
  const estimatedAreaCm2 = (estimatedAreaM2 * 10000).toFixed(1);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-stone-100">
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          {t.step3Title}
        </h2>
        <p className="text-sm text-stone-500 mt-1">{t.step3Subtitle}</p>
      </div>

      {/* Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Commodity & Properties Card */}
        <div className="bg-emerald-50/40 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-emerald-100">
            <div className="flex items-center space-x-2">
              <Box className="w-5 h-5 text-emerald-700" />
              <h3 className="font-extrabold text-base text-emerald-950">
                {language === 'en' ? 'Product Specifications' : 'उत्पाद विशिष्टताएँ'}
              </h3>
            </div>
            <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {inputs.category}
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">{t.commoditySelectLabel}:</span>
              <span className="font-bold text-stone-900">{inputs.commodityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{t.moisture}:</span>
              <span className="font-bold text-stone-900">{inputs.moisture}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{t.fat}:</span>
              <span className="font-bold text-stone-900">{inputs.fat}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{t.pH}:</span>
              <span className="font-bold text-stone-900">{inputs.pH}</span>
            </div>
            {inputs.category === 'fresh' && (
              <div className="flex justify-between">
                <span className="text-stone-500">{t.respiration}:</span>
                <span className="font-bold text-stone-900">{inputs.respirationRate} mL CO₂/kg·h</span>
              </div>
            )}
            <div className="pt-2 flex space-x-2">
              {inputs.lightSensitive ? (
                <span className="inline-flex items-center text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  <Sun className="w-3.5 h-3.5 mr-1" />
                  {language === 'en' ? 'Light Sensitive' : 'प्रकाश संवेदनशील'}
                </span>
              ) : (
                <span className="inline-flex items-center text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                  {language === 'en' ? 'Light Tolerant' : 'प्रकाश सहनशील'}
                </span>
              )}

              {inputs.oxygenSensitive ? (
                <span className="inline-flex items-center text-xs font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-md">
                  <Wind className="w-3.5 h-3.5 mr-1" />
                  {language === 'en' ? 'O₂ Sensitive' : 'O₂ संवेदनशील'}
                </span>
              ) : (
                <span className="inline-flex items-center text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                  {language === 'en' ? 'Normal O₂' : 'सामान्य O₂'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Storage, Pack & Priorities Card */}
        <div className="bg-stone-50/80 rounded-2xl p-5 border border-stone-200">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200">
            <div className="flex items-center space-x-2">
              <Thermometer className="w-5 h-5 text-emerald-700" />
              <h3 className="font-extrabold text-base text-stone-900">
                {language === 'en' ? 'Storage & Distribution' : 'भंडारण व वितरण'}
              </h3>
            </div>
            <span className="text-xs uppercase font-extrabold px-2.5 py-1 rounded-full bg-stone-200 text-stone-800">
              {inputs.storageType}
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-500">{t.desiredShelfLife}:</span>
              <span className="font-bold text-emerald-800">{inputs.desiredShelfLifeDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{t.storageTemp} & RH:</span>
              <span className="font-bold text-stone-900">{inputs.storageTemp}°C, {inputs.storageRH}% RH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{t.packWeight}:</span>
              <span className="font-bold text-stone-900">{inputs.packWeightG} g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{t.estimatedPackArea}:</span>
              <span className="font-bold text-stone-900">
                {estimatedAreaCm2} cm² ({estimatedAreaM2.toFixed(4)} m²)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{t.transportCondition}:</span>
              <span className="font-bold text-stone-900 capitalize">{inputs.transportCondition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">{t.preference}:</span>
              <span className="font-bold text-emerald-800 capitalize">{inputs.preference}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Thermodynamic Assumption Notice */}
      <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200 mb-8 flex items-start space-x-3 text-xs text-teal-950">
        <ShieldCheck className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            {language === 'en'
              ? 'Deterministic Physics & Barrier Simulation Ready'
              : 'थर्मोडायनामिक गणना व बैरियर सिमुलेशन तैयार'}
          </p>
          <p className="leading-relaxed text-teal-900">
            {language === 'en'
              ? `The engine will compute allowable moisture gain (g), maximum allowable WVTR (at 38°C / 90% RH basis), oxygen transmission ceiling, standard thickness scaling (20-150µm), respiration steady-state MAP parameters, and Arrhenius shelf life kinetics.`
              : `इंजन अनुमत नमी वृद्धि, अधिकतम WVTR, OTR सीमा, मानक मोटाई स्केलिंग और शेल्फ-लाइफ भविष्यवाणी की गणना करेगा।`}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between pt-4 border-t border-stone-100">
        <button
          onClick={onBack}
          className="px-5 py-3 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-sm rounded-xl transition-all flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>
        <button
          onClick={onSubmit}
          className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-700/25 transition-all flex items-center space-x-2.5 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-5 h-5" />
          <span>{t.calculateRecommendation}</span>
        </button>
      </div>
    </div>
  );
};
