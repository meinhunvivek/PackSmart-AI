import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Scale,
  BookOpen,
  Award,
  Zap,
  BarChart3,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Stepper } from './components/Stepper';
import { Step1Product } from './components/Step1Product';
import { Step2Storage } from './components/Step2Storage';
import { Step3Review } from './components/Step3Review';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ComparePage } from './components/ComparePage';
import { ExamplesPage } from './components/ExamplesPage';
import { COMMODITIES } from './data/commodities';
import { InputState, EvaluationResult } from './engine/types';
import { evaluatePackaging } from './engine/recommender';
import { Language, DICTIONARY } from './data/i18n';
import { SAMPLE_CASES } from './data/examples';

// Default initial state: Fresh Tomato (250g, Ambient, 14 days)
const DEFAULT_INPUTS: InputState = {
  commodityId: 'tomato',
  commodityName: 'Tomato',
  category: 'fresh',
  moisture: 94,
  fat: 0.2,
  pH: 4.4,
  respirationRate: 20,
  oxygenSensitive: false,
  lightSensitive: false,
  desiredShelfLifeDays: 14,
  storageType: 'ambient',
  storageTemp: 22,
  storageRH: 70,
  transportCondition: 'short road',
  packWeightG: 500,
  preference: 'balanced',
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [currentTab, setCurrentTab] = useState<'landing' | 'wizard' | 'results' | 'compare' | 'examples'>('landing');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [inputs, setInputs] = useState<InputState>(DEFAULT_INPUTS);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  // Check URL path or hash on initial mount (supporting /examples)
  useEffect(() => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path.includes('/examples') || hash.includes('examples')) {
      setCurrentTab('examples');
    }
  }, []);

  const updateInputs = (fields: Partial<InputState>) => {
    setInputs((prev) => ({ ...prev, ...fields }));
  };

  const handleCompute = () => {
    const result = evaluatePackaging(inputs);
    setEvaluation(result);
    setCurrentTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadTestCase = (testInputs: InputState) => {
    setInputs(testInputs);
    const result = evaluatePackaging(testInputs);
    setEvaluation(result);
    setCurrentTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEcoAlternative = () => {
    const ecoInputs: InputState = {
      ...inputs,
      preference: 'eco',
    };
    setInputs(ecoInputs);
    const result = evaluatePackaging(ecoInputs);
    setEvaluation(result);
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setWizardStep(1);
    setEvaluation(null);
    setCurrentTab('landing');
  };

  const t = DICTIONARY[language];

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-950">
      {/* Global Header */}
      <Header
        currentTab={currentTab === 'landing' ? 'wizard' : currentTab}
        setCurrentTab={(tab) => {
          if (tab === 'wizard') {
            if (currentTab === 'landing') {
              setCurrentTab('wizard');
            } else {
              setCurrentTab('wizard');
            }
          } else {
            setCurrentTab(tab);
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        language={language}
        setLanguage={setLanguage}
        onReset={handleReset}
        hasResults={evaluation !== null}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* SCREEN 1: LANDING PITCH */}
        {currentTab === 'landing' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-emerald-800">
              <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider mb-6">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{t.heroBadge}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] font-serif mb-6">
                  {t.heroHeading}
                </h1>

                <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed mb-8 max-w-2xl font-normal">
                  {t.heroDescription}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <button
                    onClick={() => {
                      setCurrentTab('wizard');
                      setWizardStep(1);
                    }}
                    className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-3 cursor-pointer"
                  >
                    <Sparkles className="w-5 h-5 text-stone-950" />
                    <span>{t.getRecommendation}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setCurrentTab('examples')}
                    className="px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{t.exploreExamples}</span>
                  </button>

                  <button
                    onClick={() => setCurrentTab('compare')}
                    className="px-6 py-4 bg-white/10 hover:bg-white/15 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Scale className="w-4 h-4" />
                    <span>{t.compareMaterials}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-stone-900 text-base mb-1">
                  Pure Physics Engine
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  WVTR & OTR flux calculations, standard gauge scaling (20-150µm), and cold-crack filtering run deterministically on the client.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-4">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-stone-900 text-base mb-1">
                  MAP & Micro-Perforations
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Calculates respiration equilibrium for living produce and specifies laser hole counts to prevent anoxia and fermentation.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-stone-900 text-base mb-1">
                  Kinetic Shelf Life Models
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Arrhenius Q10 curves chart shelf-life degradation from 0°C to 40°C with estimated spoilage reduction percentages.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs hover:border-emerald-300 transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <Leaf className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-stone-900 text-base mb-1">
                  Eco & Cost Optimization
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Compare carbon footprints (kg CO₂e), circular recyclability, and pouch batch economics (₹/1,000 packs) in real time.
                </p>
              </div>
            </div>

            {/* Featured Sample Case Shortcuts */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-stone-100 gap-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                    Instant Demo: Benchmark Case Studies
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Click any scenario to see real-time barrier calculations, MAP outputs, and AI explanations.
                  </p>
                </div>
                <button
                  onClick={() => setCurrentTab('examples')}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center space-x-1"
                >
                  <span>View All 4 Test Cases</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {SAMPLE_CASES.map((sc) => (
                  <button
                    key={sc.id}
                    onClick={() => handleLoadTestCase(sc.inputs)}
                    className="text-left p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-emerald-50/50 hover:border-emerald-400 transition-all group"
                  >
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 inline-block mb-2">
                      {sc.badge}
                    </span>
                    <h3 className="font-extrabold text-sm text-stone-900 group-hover:text-emerald-950">
                      {language === 'en' ? sc.titleEn : sc.titleHi}
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                      {language === 'en' ? sc.expectedResultEn : sc.expectedResultHi}
                    </p>
                    <div className="mt-3 flex items-center text-xs font-bold text-emerald-700">
                      <span>Simulate Now</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: 3-STEP INPUT WIZARD */}
        {currentTab === 'wizard' && (
          <div className="max-w-4xl mx-auto">
            <Stepper
              currentStep={wizardStep}
              setStep={(step) => setWizardStep(step)}
              language={language}
            />

            {wizardStep === 1 && (
              <Step1Product
                inputs={inputs}
                updateInputs={updateInputs}
                onNext={() => {
                  setWizardStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                language={language}
              />
            )}

            {wizardStep === 2 && (
              <Step2Storage
                inputs={inputs}
                updateInputs={updateInputs}
                onNext={() => {
                  setWizardStep(3);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onBack={() => {
                  setWizardStep(1);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                language={language}
              />
            )}

            {wizardStep === 3 && (
              <Step3Review
                inputs={inputs}
                onSubmit={handleCompute}
                onBack={() => {
                  setWizardStep(2);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                language={language}
              />
            )}
          </div>
        )}

        {/* SCREEN 3: RESULTS DASHBOARD */}
        {currentTab === 'results' && evaluation && (
          <ResultsDashboard
            evaluation={evaluation}
            onModifyInputs={() => {
              setCurrentTab('wizard');
              setWizardStep(1);
            }}
            onSelectEcoAlternative={handleSelectEcoAlternative}
            language={language}
          />
        )}

        {/* SCREEN 4: COMPARE MATERIALS PAGE */}
        {currentTab === 'compare' && <ComparePage language={language} />}

        {/* SCREEN 5: UNIT-TEST STYLE SAMPLE CASES PAGE */}
        {currentTab === 'examples' && (
          <ExamplesPage
            onLoadTestCase={handleLoadTestCase}
            language={language}
          />
        )}
      </main>

      {/* Global Footer */}
      <Footer language={language} />
    </div>
  );
}
