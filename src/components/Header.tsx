import React from 'react';
import { Leaf, Sparkles, Scale, BookOpen, Globe2, ShieldCheck, RefreshCw } from 'lucide-react';
import { Language, DICTIONARY } from '../data/i18n';

interface HeaderProps {
  currentTab: 'wizard' | 'results' | 'compare' | 'examples';
  setCurrentTab: (tab: 'wizard' | 'results' | 'compare' | 'examples') => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onReset: () => void;
  hasResults: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  language,
  setLanguage,
  onReset,
  hasResults,
}) => {
  const t = DICTIONARY[language];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs print:hidden">
      {/* Top Ministry Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-emerald-100 px-4 py-1.5 text-xs font-medium flex items-center justify-between tracking-wide">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{t.govtTag}</span>
          <span className="hidden md:inline-block text-emerald-400/60">•</span>
          <span className="hidden md:inline-block text-emerald-200/80">National Food Packaging Intelligence Portal</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div
            onClick={() => setCurrentTab('wizard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Leaf className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-emerald-950 font-serif">
                  Pack<span className="text-emerald-600">Smart</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  MoFPI v2.4
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium hidden sm:block truncate max-w-xs">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setCurrentTab('wizard')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'wizard'
                  ? 'bg-emerald-50 text-emerald-900 shadow-xs border border-emerald-200'
                  : 'text-stone-600 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{language === 'en' ? 'Recommender' : 'अनुशंसा विज़ार्ड'}</span>
            </button>

            {hasResults && (
              <button
                onClick={() => setCurrentTab('results')}
                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                  currentTab === 'results'
                    ? 'bg-emerald-50 text-emerald-900 shadow-xs border border-emerald-200'
                    : 'text-stone-600 hover:text-emerald-800 hover:bg-stone-50'
                }`}
              >
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>{language === 'en' ? 'Dashboard' : 'परिणाम'}</span>
              </button>
            )}

            <button
              onClick={() => setCurrentTab('compare')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'compare'
                  ? 'bg-emerald-50 text-emerald-900 shadow-xs border border-emerald-200'
                  : 'text-stone-600 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              <Scale className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">{language === 'en' ? 'Compare Materials' : 'तुलना'}</span>
              <span className="sm:hidden">{language === 'en' ? 'Compare' : 'तुलना'}</span>
            </button>

            <button
              onClick={() => setCurrentTab('examples')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center space-x-1.5 ${
                currentTab === 'examples'
                  ? 'bg-emerald-50 text-emerald-900 shadow-xs border border-emerald-200'
                  : 'text-stone-600 hover:text-emerald-800 hover:bg-stone-50'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">{language === 'en' ? 'Test Cases (/examples)' : 'केस स्टडीज'}</span>
              <span className="md:hidden">Cases</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200 ml-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  language === 'hi'
                    ? 'bg-white text-emerald-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
