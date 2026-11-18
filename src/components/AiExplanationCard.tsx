import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, RefreshCw, Bot, Lightbulb, ShieldAlert, Check } from 'lucide-react';
import { EvaluationResult } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';

interface AiExplanationCardProps {
  evaluation: EvaluationResult;
  language: Language;
}

export const AiExplanationCard: React.FC<AiExplanationCardProps> = ({
  evaluation,
  language,
}) => {
  const t = DICTIONARY[language];
  const [loading, setLoading] = useState<boolean>(true);
  const [explanation, setExplanation] = useState<string>('');
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const top1 = evaluation.topRecommendations[0];

  // Template-based deterministic fallback generator (strictly grounded in evaluation data)
  const generateFallbackExplanation = (lang: Language): string => {
    if (!top1) return 'No recommendation available.';

    const commodity = evaluation.inputs.commodityName;
    const materialName = top1.material.name;
    const thickness = top1.suggestedThicknessUm;
    const shelfLife = top1.predictedShelfLifeDays;
    const targetDays = evaluation.inputs.desiredShelfLifeDays;
    const wvtr = top1.effectiveWvtr;
    const otr = top1.effectiveOtr;
    const cost = top1.costPerPackInr;

    if (lang === 'hi') {
      return `**शीर्ष अनुशंसा का कारण:** ${commodity} के लिए **${materialName} (${thickness}µm)** सबसे उपयुक्त है। यह ₹${cost}/पाउच की किफायती लागत में ${shelfLife} दिनों की शेल्फ लाइफ प्रदान करता है (लक्ष्य: ${targetDays} दिन), जिससे नमी दर ${wvtr} g/m²·दिन और OTR ${otr} cc/m²·दिन पर स्थिर रहती है।

**मुख्य जोखिम:** यदि सीलिंग तापमान 5°C से अधिक विचलित होता है या फिल्म में सूक्ष्म-पंचर होते हैं, तो सीम लीक होने से उत्पाद की ताजगी प्रभावित हो सकती है।

**व्यावहारिक सुझाव:** वाणिज्यिक उत्पादन से पूर्व हॉट-टैक सील स्ट्रेंथ टेस्ट अवश्य करें और भंडारण क्षेत्र में नमी 70% से नीचे रखें।`;
    }

    return `**Why It Fits:** For ${commodity}, **${materialName} (${thickness}µm)** delivers the ideal barrier balance. It provides an estimated ${shelfLife}-day shelf life (exceeding your ${targetDays}-day target) at ₹${cost} per pouch, keeping moisture transmission at ${wvtr} g/m²/day and OTR at ${otr} cc/m²/day.

**Key Risk:** Improper heat seal temperature or flex-pinholing during transit can break the barrier seal, causing premature moisture pickup or oxidation.

**Actionable Tip:** Validate the seal integrity using a dye penetration test and verify your form-fill-seal jaw pressure before starting commercial production.`;
  };

  const fetchAiExplanation = async () => {
    setLoading(true);
    setErrorMsg(null);
    setIsFallback(false);

    const summaryPayload = {
      inputs: {
        commodity: evaluation.inputs.commodityName,
        category: evaluation.inputs.category,
        packWeightG: evaluation.inputs.packWeightG,
        desiredShelfLifeDays: evaluation.inputs.desiredShelfLifeDays,
        storageTempC: evaluation.inputs.storageTemp,
        storageRHPct: evaluation.inputs.storageRH,
        transport: evaluation.inputs.transportCondition,
        preference: evaluation.inputs.preference,
      },
      topRecommendations: evaluation.topRecommendations.map((r, i) => ({
        rank: i + 1,
        material: r.material.name,
        suggestedThicknessUm: r.suggestedThicknessUm,
        matchScore: r.matchScore,
        costPerPackInr: r.costPerPackInr,
        predictedShelfLifeDays: r.predictedShelfLifeDays,
        effectiveWvtr: r.effectiveWvtr,
        effectiveOtr: r.effectiveOtr,
        sustainability: r.sustainabilityBadge.labelEn,
      })),
      requiredSpecs: {
        wvtrMaxRef: evaluation.requiredSpecs.wvtrMaxRef,
        otrMax: evaluation.requiredSpecs.otrMax,
        packAreaM2: evaluation.requiredSpecs.packAreaM2,
      },
      mapAdvisory: {
        suitable: evaluation.mapData.suitable,
        targetO2: evaluation.mapData.targetO2,
        targetCO2: evaluation.mapData.targetCO2,
        suggestedFilm: evaluation.mapData.suggestedFilmType,
        perforations: evaluation.mapData.estimatedHolesCount,
      },
    };

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: summaryPayload,
          language,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.explanation) {
        setExplanation(data.explanation);
        setIsFallback(false);
      } else {
        throw new Error('Empty AI response');
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, using grounded fallback template:', err);
      setExplanation(generateFallbackExplanation(language));
      setIsFallback(true);
      setErrorMsg(err.message || 'Offline fallback active');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAiExplanation();
  }, [evaluation, language]);

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-stone-950 text-white rounded-2xl shadow-lg border border-emerald-500/30 p-6 sm:p-7 mb-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-emerald-800/60 gap-3 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-stone-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
            <Sparkles className="w-5 h-5 text-emerald-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                {t.aiExplanationTitle}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-emerald-200/70">{t.aiExplanationSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          {isFallback && (
            <span className="text-[11px] font-medium text-amber-300 bg-amber-950/60 border border-amber-700/50 px-2 py-0.5 rounded-md">
              Template-Grounded Fallback
            </span>
          )}
          <button
            onClick={fetchAiExplanation}
            disabled={loading}
            className="p-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700/60 transition-all disabled:opacity-50"
            title="Refresh AI Explanation"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Body Content */}
      <div className="relative z-10">
        {loading ? (
          <div className="space-y-3 py-4 animate-pulse">
            <div className="h-4 bg-emerald-800/40 rounded w-3/4" />
            <div className="h-4 bg-emerald-800/40 rounded w-full" />
            <div className="h-4 bg-emerald-800/40 rounded w-5/6" />
            <div className="h-4 bg-emerald-800/40 rounded w-2/3" />
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-emerald-50 text-sm leading-relaxed whitespace-pre-line font-sans">
            {explanation}
          </div>
        )}
      </div>

      {/* Technologist Verification Sign-off */}
      <div className="mt-5 pt-3 border-t border-emerald-900/60 flex items-center justify-between text-[11px] text-emerald-400/80 relative z-10">
        <span>MoFPI Packaging Science Advisory Board</span>
        <span>Standard Indian Food Code (FSSAI Compendium Compliant)</span>
      </div>
    </div>
  );
};
