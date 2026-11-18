import React, { useState } from 'react';
import { Search, Info, Sun, Wind, ChevronDown, CheckCircle2, RotateCcw } from 'lucide-react';
import { COMMODITIES, Commodity } from '../data/commodities';
import { InputState, CommodityCategory } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';

interface Step1Props {
  inputs: InputState;
  updateInputs: (fields: Partial<InputState>) => void;
  onNext: () => void;
  language: Language;
}

export const Step1Product: React.FC<Step1Props> = ({
  inputs,
  updateInputs,
  onNext,
  language,
}) => {
  const t = DICTIONARY[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const filteredCommodities = COMMODITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hindiName.includes(searchTerm) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCommodity = COMMODITIES.find((c) => c.id === inputs.commodityId);

  const handleCommoditySelect = (commodity: Commodity) => {
    updateInputs({
      commodityId: commodity.id,
      commodityName: commodity.name,
      category: commodity.category,
      moisture: commodity.moisture,
      fat: commodity.fat,
      pH: commodity.pH,
      respirationRate: commodity.respirationRate,
      oxygenSensitive: commodity.oxygenSensitive,
      lightSensitive: commodity.lightSensitive,
    });
    setIsDropdownOpen(false);
    setSearchTerm('');
    setValidationError(null);
  };

  const handleResetToBaseline = () => {
    if (selectedCommodity) {
      handleCommoditySelect(selectedCommodity);
    }
  };

  const handleProceed = () => {
    if (!inputs.commodityName) {
      setValidationError(
        language === 'en'
          ? 'Please select or name a food commodity.'
          : 'कृपया कोई खाद्य सामग्री चुनें।'
      );
      return;
    }
    if (inputs.moisture < 0 || inputs.moisture > 100) {
      setValidationError('Moisture must be between 0% and 100%.');
      return;
    }
    if (inputs.fat < 0 || inputs.fat > 100) {
      setValidationError('Fat content must be between 0% and 100%.');
      return;
    }
    if (inputs.pH < 1 || inputs.pH > 14) {
      setValidationError('pH must be between 1.0 and 14.0.');
      return;
    }
    setValidationError(null);
    onNext();
  };

  const categories: Array<{ id: CommodityCategory; labelEn: string; labelHi: string }> = [
    { id: 'fresh', labelEn: 'Fresh Produce (Fruits / Veg)', labelHi: 'ताज़ी फल व सब्ज़ियाँ' },
    { id: 'dry', labelEn: 'Dry Goods (Grains / Spices)', labelHi: 'सूखे खाद्यान्न / मसाले' },
    { id: 'fatty snack', labelEn: 'Fatty Snack (Chips / Namkeen)', labelHi: 'नमकीन / तले हुए स्नैक्स' },
    { id: 'dairy', labelEn: 'Dairy (Milk / Paneer / Cheese)', labelHi: 'डेयरी उत्पाद' },
    { id: 'meat', labelEn: 'Meat / Poultry', labelHi: 'ताज़ा मांस / पोल्ट्री' },
    { id: 'bakery', labelEn: 'Bakery (Bread / Biscuits)', labelHi: 'बेकरी उत्पाद' },
    { id: 'beverage', labelEn: 'Beverage / Liquid', labelHi: 'पेय पदार्थ' },
    { id: 'frozen', labelEn: 'Frozen Foods (-18°C)', labelHi: 'फ्रोजन खाद्य' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8">
      {/* Step Header */}
      <div className="mb-6 pb-6 border-b border-stone-100">
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          {t.step1Title}
        </h2>
        <p className="text-sm text-stone-500 mt-1">{t.step1Subtitle}</p>
      </div>

      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center">
          <Info className="w-5 h-5 mr-2 shrink-0 text-rose-600" />
          {validationError}
        </div>
      )}

      {/* Commodity Search & Selector Dropdown */}
      <div className="mb-8">
        <label className="block text-sm font-bold text-stone-800 mb-2">
          {t.commoditySelectLabel} <span className="text-emerald-600">*</span>
        </label>
        <div className="relative">
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl cursor-pointer hover:border-emerald-600 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                {selectedCommodity?.name.charAt(0) ?? 'P'}
              </div>
              <div>
                <span className="font-bold text-stone-900 block text-base">
                  {selectedCommodity ? selectedCommodity.name : 'Choose a food commodity...'}
                </span>
                {selectedCommodity && (
                  <span className="text-xs text-stone-500">
                    {selectedCommodity.hindiName} • {selectedCommodity.category.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-stone-400" />
          </div>

          {/* Search Dropdown Panel */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-stone-200 rounded-2xl shadow-xl p-3 max-h-80 overflow-y-auto">
              <div className="relative mb-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder={language === 'en' ? 'Type commodity name (e.g. Potato, Spinach, Paneer)...' : 'नाम खोजें (जैसे आलू, पालक, पनीर)...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              <div className="divide-y divide-stone-100">
                {filteredCommodities.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleCommoditySelect(item)}
                    className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-emerald-50/60 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-sm text-stone-900 group-hover:text-emerald-900">
                        {item.name} <span className="text-xs font-normal text-stone-500">({item.hindiName})</span>
                      </div>
                      <div className="text-xs text-stone-500">
                        Moisture: {item.moisture}% | Fat: {item.fat}% | Cat: {item.category}
                      </div>
                    </div>
                    {inputs.commodityId === item.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                  </button>
                ))}
                {filteredCommodities.length === 0 && (
                  <div className="py-4 text-center text-xs text-stone-400">
                    No commodity matched. You can manually enter details below.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Auto-fill notification & reset button */}
        <div className="mt-3 flex items-center justify-between text-xs bg-emerald-50/80 p-2.5 rounded-lg border border-emerald-100 text-emerald-900">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{t.customOverrideNote}</span>
          </div>
          {selectedCommodity && (
            <button
              onClick={handleResetToBaseline}
              className="font-bold text-emerald-700 hover:text-emerald-950 flex items-center space-x-1 shrink-0 ml-2"
              title="Reset parameters to scientific baseline"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Editable Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Category */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            {t.category}
          </label>
          <select
            value={inputs.category}
            onChange={(e) => updateInputs({ category: e.target.value as CommodityCategory })}
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {language === 'en' ? c.labelEn : c.labelHi}
              </option>
            ))}
          </select>
        </div>

        {/* Moisture % */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t.moisture}
            </label>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {inputs.moisture}%
            </span>
          </div>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={inputs.moisture}
            onChange={(e) => updateInputs({ moisture: parseFloat(e.target.value) || 0 })}
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Fat % */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t.fat}
            </label>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
              {inputs.fat}%
            </span>
          </div>
          <input
            type="number"
            min="0"
            max="100"
            step="0.5"
            value={inputs.fat}
            onChange={(e) => updateInputs({ fat: parseFloat(e.target.value) || 0 })}
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
          {inputs.fat > 20 && (
            <p className="text-[11px] text-amber-700 mt-1 font-medium">
              High fat (&gt;20%) mandates tighter 3× OTR barrier constraint against rancidity.
            </p>
          )}
        </div>

        {/* pH Value */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t.pH}
            </label>
            <span className="text-xs font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
              {inputs.pH}
            </span>
          </div>
          <input
            type="number"
            min="1"
            max="14"
            step="0.1"
            value={inputs.pH}
            onChange={(e) => updateInputs({ pH: parseFloat(e.target.value) || 7 })}
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        {/* Respiration Rate (fresh produce only) */}
        <div className={inputs.category === 'fresh' ? 'opacity-100' : 'opacity-40'}>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t.respiration}
            </label>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
              {inputs.respirationRate} mL/kg·h
            </span>
          </div>
          <input
            type="number"
            min="0"
            max="250"
            step="1"
            disabled={inputs.category !== 'fresh'}
            value={inputs.respirationRate}
            onChange={(e) => updateInputs({ respirationRate: parseFloat(e.target.value) || 0 })}
            className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden disabled:bg-stone-100 disabled:cursor-not-allowed"
          />
          {inputs.category === 'fresh' && (
            <p className="text-[11px] text-teal-700 mt-1 font-medium">
              Calibrated at standard 10°C; scaled to storage temp via Q10=2.5.
            </p>
          )}
        </div>
      </div>

      {/* Sensitivity Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Light Sensitivity */}
        <div
          onClick={() => updateInputs({ lightSensitive: !inputs.lightSensitive })}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start space-x-3 ${
            inputs.lightSensitive
              ? 'bg-amber-50/70 border-amber-500 shadow-xs'
              : 'bg-stone-50 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              inputs.lightSensitive ? 'bg-amber-500 text-white' : 'bg-stone-200 text-stone-600'
            }`}
          >
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-stone-900">{t.lightSensitive}</div>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'en'
                ? 'Mandates metallized foil or opaque barrier layer (filters out clear films).'
                : 'प्रकाशरोधी मेटलाइज्ड परत अनिवार्य करता है (पारदर्शी फिल्मों को खारिज करता है)।'}
            </p>
          </div>
        </div>

        {/* Oxygen Sensitivity */}
        <div
          onClick={() => updateInputs({ oxygenSensitive: !inputs.oxygenSensitive })}
          className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start space-x-3 ${
            inputs.oxygenSensitive
              ? 'bg-sky-50/70 border-sky-500 shadow-xs'
              : 'bg-stone-50 border-stone-200 hover:border-stone-300'
          }`}
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              inputs.oxygenSensitive ? 'bg-sky-500 text-white' : 'bg-stone-200 text-stone-600'
            }`}
          >
            <Wind className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm text-stone-900">{t.oxygenSensitive}</div>
            <p className="text-xs text-stone-500 mt-0.5">
              {language === 'en'
                ? 'Applies tight OTR ceiling & activates N₂ flush / hermetic seal check.'
                : 'कड़ा OTR अवरोधक लागू करता है और नाइट्रोजन फ्लश की सिफारिश करता है।'}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-end pt-4 border-t border-stone-100">
        <button
          onClick={handleProceed}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center space-x-2"
        >
          <span>{t.next}</span>
          <span>→</span>
        </button>
      </div>
    </div>
  );
};
