import React, { useState } from 'react';
import {
  Printer,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  Leaf,
  Layers,
  Award,
  ChevronRight,
  TrendingDown,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { EvaluationResult, ScoredMaterial } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';
import { RequiredSpecsPanel } from './RequiredSpecsPanel';
import { MapPanel } from './MapPanel';
import { ShelfLifeChart } from './ShelfLifeChart';
import { RadarComparisonChart } from './RadarComparisonChart';
import { CostEcoBarChart } from './CostEcoBarChart';
import { AiExplanationCard } from './AiExplanationCard';

interface ResultsDashboardProps {
  evaluation: EvaluationResult;
  onModifyInputs: () => void;
  onSelectEcoAlternative: () => void;
  language: Language;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  evaluation,
  onModifyInputs,
  onSelectEcoAlternative,
  language,
}) => {
  const t = DICTIONARY[language];
  const [showEcoModal, setShowEcoModal] = useState(false);

  const {
    inputs,
    requiredSpecs,
    topRecommendations,
    mapData,
    shelfLifeCurve,
    ecoAlternativeMaterial,
    ecoAlternativeTradeoff,
  } = evaluation;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Printable Header (Visible only when printing) */}
      <div className="hidden print:block pb-4 mb-4 border-b-2 border-emerald-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-emerald-950 font-serif">
              PackSmart Packaging Recommendation Dossier
            </h1>
            <p className="text-xs text-stone-600">
              Ministry of Food Processing Industries (MoFPI) • Government of India
            </p>
          </div>
          <div className="text-right text-xs text-stone-500">
            <div>Product: {inputs.commodityName} ({inputs.packWeightG}g)</div>
            <div>Generated: {new Date().toLocaleDateString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Top Banner & Control Bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-900">
              {inputs.category.toUpperCase()}
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs font-bold text-stone-600">
              {inputs.packWeightG}g Pack • {inputs.desiredShelfLifeDays} Days Target
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 mt-1 tracking-tight">
            {language === 'en'
              ? `Optimal Packaging for ${inputs.commodityName}`
              : `${inputs.commodityName} के लिए सर्वोत्तम पैकेजिंग`}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {t.resultsSubtitle}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 self-start md:self-auto">
          {ecoAlternativeMaterial && (
            <button
              onClick={() => setShowEcoModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 shadow-xs transition-all flex items-center space-x-1.5"
            >
              <Leaf className="w-3.5 h-3.5 text-teal-600" />
              <span>{t.ecoAlternativeBtn}</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 shadow-xs transition-all flex items-center space-x-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-stone-600" />
            <span>{t.downloadPdf}</span>
          </button>

          <button
            onClick={onModifyInputs}
            className="px-4 py-2 rounded-xl text-xs font-extrabold bg-emerald-700 hover:bg-emerald-800 text-white shadow-md shadow-emerald-700/20 transition-all flex items-center space-x-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Modify Specs' : 'बदलें'}</span>
          </button>
        </div>
      </div>

      {/* Eco Alternative Modal Dialog */}
      {showEcoModal && ecoAlternativeMaterial && ecoAlternativeTradeoff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-teal-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2 text-teal-800">
                <Leaf className="w-5 h-5 text-teal-600" />
                <h3 className="font-extrabold text-lg text-stone-900">
                  {language === 'en' ? 'Eco-Friendly Alternative Trade-off' : 'पर्यावरण-अनुकूल विकल्प विश्लेषण'}
                </h3>
              </div>
              <button
                onClick={() => setShowEcoModal(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              {language === 'en'
                ? `You can switch to ${ecoAlternativeMaterial.material.name} to maximize biodegradability and compostability. Here is the engineering trade-off comparison vs the #1 ranked conventional choice:`
                : `${ecoAlternativeMaterial.material.name} का उपयोग करने पर पर्यावरण लाभ व शेल्फ-लाइफ तुलना नीचे दी गई है:`}
            </p>

            <div className="grid grid-cols-3 gap-2.5 mb-5 text-center">
              <div className="bg-teal-50 p-3 rounded-xl border border-teal-100">
                <div className="text-[10px] font-bold text-teal-700 uppercase">Eco Score Gain</div>
                <div className="text-lg font-black text-teal-900">
                  +{ecoAlternativeTradeoff.ecoScoreGainPct} pts
                </div>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <div className="text-[10px] font-bold text-amber-700 uppercase">Shelf Life Diff</div>
                <div className="text-lg font-black text-amber-900">
                  {ecoAlternativeTradeoff.shelfLifeDiffDays >= 0 ? '+' : ''}
                  {ecoAlternativeTradeoff.shelfLifeDiffDays} d
                </div>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="text-[10px] font-bold text-stone-500 uppercase">Cost Diff</div>
                <div className="text-lg font-black text-stone-900">
                  {ecoAlternativeTradeoff.costDiffPct >= 0 ? '+' : ''}
                  {ecoAlternativeTradeoff.costDiffPct}%
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 mb-5 space-y-1">
              <div>
                <strong>Material:</strong> {ecoAlternativeMaterial.material.name} ({ecoAlternativeMaterial.suggestedThicknessUm}µm)
              </div>
              <div>
                <strong>Recyclability:</strong> {ecoAlternativeMaterial.material.recyclingCode || ecoAlternativeMaterial.material.recyclable}
              </div>
              <div>
                <strong>Predicted Life:</strong> {ecoAlternativeMaterial.predictedShelfLifeDays} days (vs target {inputs.desiredShelfLifeDays} days)
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowEcoModal(false)}
                className="flex-1 py-2.5 border border-stone-300 rounded-xl font-bold text-xs text-stone-700 hover:bg-stone-50"
              >
                {language === 'en' ? 'Close' : 'बंद करें'}
              </button>
              <button
                onClick={() => {
                  setShowEcoModal(false);
                  onSelectEcoAlternative();
                }}
                className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-700/20"
              >
                {language === 'en' ? 'Re-rank with Eco Priority' : 'पर्यावरण प्राथमिकता लागू करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Ranked Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
              {t.topRecommendations}
            </h2>
          </div>
          <span className="text-xs font-bold text-stone-400">
            {topRecommendations.length} Ranked Solutions
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topRecommendations.map((item, index) => {
            const isRank1 = index === 0;

            const badgeColorClass =
              item.sustainabilityBadge.level === 'green'
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : item.sustainabilityBadge.level === 'amber'
                ? 'bg-amber-100 text-amber-800 border-amber-300'
                : 'bg-rose-100 text-rose-800 border-rose-300';

            return (
              <div
                key={item.material.id}
                className={`relative rounded-2xl p-6 transition-all border flex flex-col justify-between ${
                  isRank1
                    ? 'bg-gradient-to-b from-white to-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                    : 'bg-white border-stone-200/90 shadow-xs hover:border-emerald-300'
                }`}
              >
                {/* Badges on Top */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                          isRank1
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        #{index + 1}
                      </span>
                      {isRank1 && (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-600 text-white">
                          Best Overall
                        </span>
                      )}
                      {item.isBestValue && (
                        <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500 text-white flex items-center">
                          <IndianRupee className="w-2.5 h-2.5 mr-0.5" />
                          {t.bestValueBadge}
                        </span>
                      )}
                    </div>

                    {/* Match Score */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-950">
                        {item.matchScore}%
                      </div>
                      <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                        {t.matchScore}
                      </div>
                    </div>
                  </div>

                  {/* Title & Short Description */}
                  <h3 className="font-extrabold text-base text-stone-900 leading-snug">
                    {item.material.name}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {language === 'en' ? item.material.descriptionEn : item.material.descriptionHi}
                  </p>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-100 text-xs">
                    <div className="bg-stone-50 p-2 rounded-lg">
                      <span className="text-stone-400 text-[10px] block uppercase font-bold">
                        {t.suggestedThickness}
                      </span>
                      <span className="font-black text-stone-800 text-sm">
                        {item.suggestedThicknessUm} µm
                      </span>
                    </div>

                    <div className="bg-stone-50 p-2 rounded-lg">
                      <span className="text-stone-400 text-[10px] block uppercase font-bold">
                        {t.costPerPack}
                      </span>
                      <span className="font-black text-emerald-800 text-sm">
                        ₹{item.costPerPackInr}
                      </span>
                    </div>

                    <div className="bg-stone-50 p-2 rounded-lg">
                      <span className="text-stone-400 text-[10px] block uppercase font-bold">
                        Est. Shelf Life
                      </span>
                      <span className="font-black text-stone-800 text-sm">
                        {item.predictedShelfLifeDays} {language === 'en' ? 'days' : 'दिन'}
                      </span>
                    </div>

                    <div className="bg-stone-50 p-2 rounded-lg">
                      <span className="text-stone-400 text-[10px] block uppercase font-bold">
                        {t.costPer1000}
                      </span>
                      <span className="font-black text-stone-800 text-sm">
                        ₹{item.costPer1000PacksInr}
                      </span>
                    </div>
                  </div>

                  {/* Barrier Values (Effective at suggested thickness) */}
                  <div className="mt-3 text-[11px] text-stone-600 space-y-1 bg-stone-50/60 p-2.5 rounded-lg border border-stone-200/50">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Effective WVTR:</span>
                      <span className="font-bold text-stone-800">{item.effectiveWvtr} g/m²·d</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Effective OTR:</span>
                      <span className="font-bold text-stone-800">{item.effectiveOtr} cc/m²·d</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Tensile Strength:</span>
                      <span className="font-bold text-stone-800">{item.material.tensileStrengthMpa} MPa</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Reason & Sustainability Badge */}
                <div className="mt-4 pt-3 border-t border-stone-100">
                  <div className="text-xs text-stone-700 font-medium mb-3 leading-relaxed">
                    <span className="font-bold text-emerald-900">
                      {language === 'en' ? 'Reason: ' : 'कारण: '}
                    </span>
                    {language === 'en' ? item.reasonEn : item.reasonHi}
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${badgeColorClass}`}
                    >
                      <Leaf className="w-3 h-3 mr-1" />
                      {language === 'en'
                        ? item.sustainabilityBadge.labelEn
                        : item.sustainabilityBadge.labelHi}
                    </span>

                    <span className="text-[11px] text-stone-500 font-semibold">
                      {item.material.recyclingCode || item.material.recyclable}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Explanation Card */}
      <AiExplanationCard evaluation={evaluation} language={language} />

      {/* Specifications & MAP Panels */}
      <RequiredSpecsPanel specs={requiredSpecs} language={language} />

      <MapPanel
        mapData={mapData}
        isFreshProduce={requiredSpecs.isFreshProduce}
        language={language}
      />

      {/* Shelf Life Prediction Curve Chart */}
      <ShelfLifeChart
        shelfLifeCurve={shelfLifeCurve}
        topRecommendations={topRecommendations}
        desiredShelfLifeDays={inputs.desiredShelfLifeDays}
        language={language}
      />

      {/* Multi-Criteria Radar & Cost Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RadarComparisonChart
          topRecommendations={topRecommendations}
          language={language}
        />
        <CostEcoBarChart
          topRecommendations={topRecommendations}
          language={language}
        />
      </div>
    </div>
  );
};
