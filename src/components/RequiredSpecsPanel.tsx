import React from 'react';
import { ShieldCheck, Droplets, Wind, Sun, Snowflake, Layers } from 'lucide-react';
import { RequiredSpecs } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';

interface RequiredSpecsPanelProps {
  specs: RequiredSpecs;
  language: Language;
}

export const RequiredSpecsPanel: React.FC<RequiredSpecsPanelProps> = ({ specs, language }) => {
  const t = DICTIONARY[language];

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-5 sm:p-6 mb-8">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900 tracking-tight">
              {t.requiredSpecsTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'en'
                ? 'Derived threshold limits computed from product water activity & oxidation physics'
                : 'खाद्य जल गतिविधि और ऑक्सीकरण भौतिकी से निर्धारित सीमाएं'}
            </p>
          </div>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 bg-stone-100 rounded-lg text-stone-700">
          MoFPI Spec Sheet
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* WVTR Max Ref */}
        <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-600 mb-1">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.wvtrMaxLabel}</span>
          </div>
          <div className="text-lg font-black text-stone-900">
            {specs.wvtrMaxRef}{' '}
            <span className="text-[11px] font-normal text-stone-500">g/m²·day</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            At 38°C, 90% RH (Standard ASTM F1249)
          </div>
        </div>

        {/* OTR Max */}
        <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-600 mb-1">
            <Wind className="w-3.5 h-3.5 text-sky-600" />
            <span>{t.otrMaxLabel}</span>
          </div>
          <div className="text-lg font-black text-stone-900">
            {specs.otrMax > 5000 ? '>5,000 (Breathable)' : `${specs.otrMax}`}{' '}
            <span className="text-[11px] font-normal text-stone-500">cc/m²·day</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            At 23°C, 0% RH (ASTM D3985)
          </div>
        </div>

        {/* Surface Area */}
        <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-600 mb-1">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pouch Surface Area</span>
          </div>
          <div className="text-lg font-black text-stone-900">
            {(specs.packAreaM2 * 10000).toFixed(0)}{' '}
            <span className="text-[11px] font-normal text-stone-500">cm²</span>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            {specs.packAreaM2.toFixed(4)} m² pouch
          </div>
        </div>

        {/* Environmental Demands */}
        <div className="bg-stone-50/80 p-3.5 rounded-xl border border-stone-200">
          <div className="text-xs font-bold text-stone-600 mb-1">Mandatory Constraints</div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {specs.requiresLightBarrier && (
              <span className="inline-flex items-center text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                <Sun className="w-3 h-3 mr-0.5" /> Light Barrier
              </span>
            )}
            {specs.requiresColdCrackResistance && (
              <span className="inline-flex items-center text-[10px] font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded">
                <Snowflake className="w-3 h-3 mr-0.5" /> Cold Crack
              </span>
            )}
            {specs.requiresHermeticSeal && (
              <span className="inline-flex items-center text-[10px] font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">
                Hermetic Seal
              </span>
            )}
            {!specs.requiresLightBarrier && !specs.requiresColdCrackResistance && (
              <span className="text-xs text-stone-500">Standard Pouch</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 text-[11px] text-stone-500 italic">
        {specs.areaAssumptionText}
      </div>
    </div>
  );
};
