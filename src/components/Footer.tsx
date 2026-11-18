import React from 'react';
import { ShieldAlert, Info, ExternalLink } from 'lucide-react';
import { Language, DICTIONARY } from '../data/i18n';

interface FooterProps {
  language: Language;
}

export const Footer: React.FC<FooterProps> = ({ language }) => {
  const t = DICTIONARY[language];

  return (
    <footer className="mt-16 bg-stone-900 text-stone-300 border-t border-stone-800 print:mt-6 print:bg-white print:text-black print:border-t-2 print:border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Disclaimers & Notes */}
        <div className="bg-stone-800/80 rounded-xl p-4 border border-stone-700/60 mb-6">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-amber-300">
                {language === 'en' ? 'Statutory Disclaimer' : 'वैधानिक सूचना'}:
              </p>
              <p className="text-stone-300 leading-relaxed">{t.disclaimer}</p>
              <p className="text-stone-400 italic flex items-center pt-1">
                <Info className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                {t.indicativeNote}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col md:flex-row items-center justify-between text-xs text-stone-400 space-y-3 md:space-y-0">
          <div>
            <span className="font-bold text-stone-200">PackSmart India</span> • Ministry of Food
            Processing Industries (MoFPI)
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-stone-400">Developed in partnership with CSIR-CFTRI & IIP</span>
            <span className="hidden sm:inline text-stone-600">|</span>
            <span className="text-emerald-400">Pure Thermodynamic & Barrier Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
