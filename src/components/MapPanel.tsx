import React from 'react';
import { Wind, AlertTriangle, CheckCircle, Info, Sparkles, Flame } from 'lucide-react';
import { MapRecommendation } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';

interface MapPanelProps {
  mapData: MapRecommendation;
  isFreshProduce: boolean;
  language: Language;
}

export const MapPanel: React.FC<MapPanelProps> = ({ mapData, isFreshProduce, language }) => {
  const t = DICTIONARY[language];

  const badgeColorClass =
    mapData.badgeColor === 'emerald'
      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
      : mapData.badgeColor === 'amber'
      ? 'bg-amber-100 text-amber-900 border-amber-300'
      : 'bg-stone-100 text-stone-700 border-stone-300';

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-5 sm:p-6 mb-8">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-stone-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900 tracking-tight">
              {t.mapPanelTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {isFreshProduce
                ? language === 'en'
                  ? 'Active metabolic steady-state gas equilibrium simulation'
                  : 'सक्रिय चयापचय गैस संतुलन व श्वसन सिमुलेशन'
                : language === 'en'
                ? 'Modified atmosphere and inert gas flushing protocols'
                : 'संशोधित वातावरण एवं अक्रिय गैस फ्लशिंग तकनीक'}
            </p>
          </div>
        </div>

        {/* Suitability Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs font-bold text-stone-500">{t.mapSuitability}:</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold border ${badgeColorClass} flex items-center space-x-1`}
          >
            {mapData.suitable === 'Yes' && <CheckCircle className="w-3.5 h-3.5 mr-1" />}
            {mapData.suitable === 'Conditional' && <AlertTriangle className="w-3.5 h-3.5 mr-1" />}
            <span>
              {mapData.suitable === 'Yes'
                ? language === 'en' ? 'MAP Recommended' : 'अनुशंसित (Recommended)'
                : mapData.suitable === 'Conditional'
                ? language === 'en' ? 'Conditional (Strict Cold Chain)' : 'शर्तयुक्त (Conditional)'
                : language === 'en' ? 'Passive Barrier Sufficient' : 'सामान्य बैरियर पर्याप्त'}
            </span>
          </span>
        </div>
      </div>

      {/* Anaerobic Risk Warning Alert */}
      {mapData.anaerobicRiskWarning && (
        <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold text-sm text-amber-950 mb-0.5">
              {t.anaerobicWarning}
            </div>
            <p className="leading-relaxed">
              {language === 'en'
                ? 'High ambient storage temperature elevates vegetable respiration beyond film diffusion capacity. Without laser micro-perforations, package oxygen will drop below 1.0%, triggering alcoholic fermentation, foul off-odors, and tissue collapse.'
                : 'उच्च तापमान पर श्वसन दर बढ़ने से ऑक्सीजन 1.0% से नीचे गिर सकती है, जिससे उत्पाद में बदबू व सड़न पैदा होगी। लेज़र सूक्ष्म-छिद्र अनिवार्य हैं।'}
            </p>
          </div>
        </div>
      )}

      {/* Gas Targets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Target Gas Mix */}
        <div className="bg-stone-50/80 p-4 rounded-xl border border-stone-200">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
            {t.targetGasMix}
          </div>
          <div className="space-y-1">
            <div className="text-sm font-extrabold text-emerald-800">
              {mapData.targetO2}
            </div>
            <div className="text-sm font-extrabold text-sky-800">
              {mapData.targetCO2}
            </div>
            <div className="text-xs font-semibold text-stone-600">
              {mapData.targetN2}
            </div>
          </div>
        </div>

        {/* Respiration & OTR Requirement */}
        <div className="bg-stone-50/80 p-4 rounded-xl border border-stone-200">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
            {isFreshProduce ? 'Required Gas Flux (Steady-State)' : 'Inert Gas Flushing Pressure'}
          </div>
          {isFreshProduce ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Respiration RR(T):</span>
                <span className="font-bold text-stone-900">{mapData.respirationAtTemp} mL/kg·h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Required OTR:</span>
                <span className="font-bold text-stone-900">{mapData.otrRequired.toLocaleString()} mL/m²·d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Required CO₂TR:</span>
                <span className="font-bold text-stone-900">{mapData.co2trRequired.toLocaleString()} mL/m²·d</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-stone-500">Residual O₂ Limit:</span>
                <span className="font-bold text-emerald-800">&lt; 0.5% - 1.0%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Headspace Flush:</span>
                <span className="font-bold text-stone-900">Food-grade N₂ / CO₂</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Pillow Cushion:</span>
                <span className="font-bold text-stone-900">+15 to +25 mbar</span>
              </div>
            </div>
          )}
        </div>

        {/* Film & Perforation Recommendation */}
        <div className="bg-stone-50/80 p-4 rounded-xl border border-stone-200">
          <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1">
            Film & Micro-Hole Architecture
          </div>
          <div className="text-xs font-bold text-stone-900 mb-1">
            {mapData.suggestedFilmType}
          </div>
          <div className="text-xs text-stone-600 leading-relaxed">
            {language === 'en' ? mapData.perforationRecommendationEn : mapData.perforationRecommendationHi}
          </div>
        </div>
      </div>

      {/* Advisory Narrative */}
      <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start space-x-2.5 text-xs text-emerald-950">
        <Info className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">
            {language === 'en' ? 'Technologist Rationale' : 'वैज्ञानिक दृष्टिकोण'}:{' '}
          </span>
          {language === 'en' ? mapData.gasMixDescriptionEn : mapData.gasMixDescriptionHi}
          {mapData.nonProduceAdviceEn && (
            <p className="mt-1 font-medium text-stone-700">
              {language === 'en' ? mapData.nonProduceAdviceEn : mapData.nonProduceAdviceHi}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
