import React from 'react';
import { Snowflake, Thermometer, CloudRain, Truck, Weight, Target, ArrowLeft, ArrowRight } from 'lucide-react';
import { InputState, StorageType, TransportCondition, UserPreference } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';

interface Step2Props {
  inputs: InputState;
  updateInputs: (fields: Partial<InputState>) => void;
  onNext: () => void;
  onBack: () => void;
  language: Language;
}

export const Step2Storage: React.FC<Step2Props> = ({
  inputs,
  updateInputs,
  onNext,
  onBack,
  language,
}) => {
  const t = DICTIONARY[language];

  const handleStorageTypeChange = (type: StorageType) => {
    let defaultTemp = inputs.storageTemp;
    let defaultRH = inputs.storageRH;

    if (type === 'frozen') {
      defaultTemp = -18;
      defaultRH = 85;
    } else if (type === 'chilled') {
      defaultTemp = 4;
      defaultRH = 90;
    } else {
      defaultTemp = 25;
      defaultRH = 65;
    }

    updateInputs({
      storageType: type,
      storageTemp: defaultTemp,
      storageRH: defaultRH,
    });
  };

  const transportModes: Array<{ id: TransportCondition; labelEn: string; labelHi: string; descEn: string }> = [
    {
      id: 'short road',
      labelEn: t.shortRoad,
      labelHi: 'स्थानीय सड़क परिवहन (<200 किमी)',
      descEn: 'Low vibration, standard corrugated shipper cartons',
    },
    {
      id: 'long road',
      labelEn: t.longRoad,
      labelHi: 'राष्ट्रीय लंबी दूरी की सड़क',
      descEn: 'High vibration, multi-day road transit across states',
    },
    {
      id: 'export sea',
      labelEn: t.exportSea,
      labelHi: 'समुद्री निर्यात कंटेनर (कठिन)',
      descEn: 'High ambient humidity, condensation risk, long transit (30-60d)',
    },
    {
      id: 'cold chain',
      labelEn: t.coldChain,
      labelHi: 'रेफ्रिजरेटेड कोल्ड वैन',
      descEn: 'Constant temperature Reefer vehicle distribution',
    },
  ];

  const preferences: Array<{ id: UserPreference; titleEn: string; titleHi: string; descEn: string }> = [
    {
      id: 'balanced',
      titleEn: t.prefBalanced,
      titleHi: 'संतुलित (बैरियर + पर्यावरण + लागत)',
      descEn: 'Engine weights: Barrier 35%, Eco 20%, Cost 20%, Mech 15%, Transit 10%',
    },
    {
      id: 'lowest cost',
      titleEn: t.prefLowestCost,
      titleHi: 'न्यूनतम पैकेजिंग लागत',
      descEn: 'Engine weights: Cost 40%, Barrier 30%, Eco 10%, Mech 10%, Transit 10%',
    },
    {
      id: 'best shelf life',
      titleEn: t.prefBestShelfLife,
      titleHi: 'अधिकतम शेल्फ-लाइफ सुरक्षा',
      descEn: 'Engine weights: Barrier 55%, Mech 15%, Cost 10%, Eco 10%, Transit 10%',
    },
    {
      id: 'eco',
      titleEn: t.prefEco,
      titleHi: 'सर्वाधिक पर्यावरण अनुकूल',
      descEn: 'Engine weights: Eco 40%, Barrier 25%, Cost 15%, Mech 10%, Transit 10%',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200/80 p-6 sm:p-8">
      {/* Step Header */}
      <div className="mb-6 pb-6 border-b border-stone-100">
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          {t.step2Title}
        </h2>
        <p className="text-sm text-stone-500 mt-1">{t.step2Subtitle}</p>
      </div>

      <div className="space-y-8">
        {/* Desired Shelf Life & Unit Pack Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shelf Life */}
          <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center">
                <Target className="w-4 h-4 mr-1.5 text-emerald-600" />
                {t.desiredShelfLife}
              </label>
              <span className="text-base font-extrabold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg">
                {inputs.desiredShelfLifeDays} {language === 'en' ? 'days' : 'दिन'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-3">
              {language === 'en'
                ? 'Target commercial shelf life from packing to final retail sale.'
                : 'पैकिंग से अंतिम उपभोक्ता बिक्री तक की लक्षित अवधि।'}
            </p>
            <input
              type="range"
              min="1"
              max="730"
              value={inputs.desiredShelfLifeDays}
              onChange={(e) => updateInputs({ desiredShelfLifeDays: parseInt(e.target.value, 10) || 1 })}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1 font-semibold">
              <span>1 Day (Ultra-fresh)</span>
              <span>30 Days (Chilled)</span>
              <span>180 Days (6 Mo)</span>
              <span>2 Years</span>
            </div>
          </div>

          {/* Unit Pack Weight (g) */}
          <div className="bg-stone-50/70 p-5 rounded-2xl border border-stone-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center">
                <Weight className="w-4 h-4 mr-1.5 text-emerald-600" />
                {t.packWeight}
              </label>
              <span className="text-base font-extrabold text-stone-900 bg-stone-200/80 px-2.5 py-0.5 rounded-lg">
                {inputs.packWeightG} g {inputs.packWeightG >= 1000 ? `(${(inputs.packWeightG / 1000).toFixed(1)} kg)` : ''}
              </span>
            </div>
            <p className="text-xs text-stone-500 mb-3">
              {language === 'en'
                ? 'Used to compute surface-area-to-volume ratio A ≈ 0.0004 × W^0.7.'
                : 'क्षेत्रफल व मात्रा अनुपात की गणना के लिए उपयोग।'}
            </p>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="5"
                max="25000"
                step="5"
                value={inputs.packWeightG}
                onChange={(e) => updateInputs({ packWeightG: Math.max(5, parseInt(e.target.value, 10) || 100) })}
                className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-sm font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex space-x-1 shrink-0">
                {[50, 250, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => updateInputs({ packWeightG: preset })}
                    className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-emerald-50 border border-stone-200 rounded-lg text-stone-700 hover:text-emerald-800"
                  >
                    {preset >= 1000 ? `${preset / 1000}kg` : `${preset}g`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Storage Environment Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center">
            <Snowflake className="w-4 h-4 mr-1.5 text-emerald-600" />
            {t.storageType}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'ambient' as StorageType, label: t.ambient, temp: '15°C to 35°C', icon: '☀️' },
              { id: 'chilled' as StorageType, label: t.chilled, temp: '0°C to 8°C', icon: '❄️' },
              { id: 'frozen' as StorageType, label: t.frozen, temp: '-18°C or below', icon: '🧊' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => handleStorageTypeChange(st.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  inputs.storageType === st.id
                    ? 'bg-emerald-50/80 border-emerald-600 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-xl mb-1">{st.icon}</div>
                <div className="font-bold text-sm text-stone-900">{st.label}</div>
                <div className="text-xs text-stone-500 mt-0.5">{st.temp}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Precise Temperature & RH Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-stone-50/60 p-5 rounded-2xl border border-stone-200">
          {/* Temperature */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center">
                <Thermometer className="w-4 h-4 mr-1 text-emerald-600" />
                {t.storageTemp}
              </label>
              <span className="text-sm font-bold text-stone-900 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200">
                {inputs.storageTemp}°C
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="45"
              step="1"
              value={inputs.storageTemp}
              onChange={(e) => updateInputs({ storageTemp: parseInt(e.target.value, 10) || 0 })}
              className="w-full accent-emerald-600 cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>-25°C Deep freeze</span>
              <span>4°C Chilled</span>
              <span>25°C Ambient</span>
              <span>45°C Hot summer</span>
            </div>
          </div>

          {/* Relative Humidity */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center">
                <CloudRain className="w-4 h-4 mr-1 text-emerald-600" />
                {t.storageRH}
              </label>
              <span className="text-sm font-bold text-stone-900 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200">
                {inputs.storageRH}% RH
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={inputs.storageRH}
              onChange={(e) => updateInputs({ storageRH: parseInt(e.target.value, 10) || 50 })}
              className="w-full accent-emerald-600 cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[11px] text-stone-400 mt-1">
              <span>20% Arid / Dry</span>
              <span>65% Standard</span>
              <span>90% High Humidity</span>
              <span>100% Saturation</span>
            </div>
          </div>
        </div>

        {/* Transport Condition */}
        <div>
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center">
            <Truck className="w-4 h-4 mr-1.5 text-emerald-600" />
            {t.transportCondition}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {transportModes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateInputs({ transportCondition: mode.id })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  inputs.transportCondition === mode.id
                    ? 'bg-emerald-50/90 border-emerald-600 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="font-bold text-sm text-stone-900">
                  {language === 'en' ? mode.labelEn : mode.labelHi}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">{mode.descEn}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Optimization Priority (Preference) */}
        <div>
          <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-3 flex items-center">
            <Target className="w-4 h-4 mr-1.5 text-emerald-600" />
            {t.preference}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {preferences.map((pref) => (
              <button
                key={pref.id}
                type="button"
                onClick={() => updateInputs({ preference: pref.id })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  inputs.preference === pref.id
                    ? 'bg-emerald-50/90 border-emerald-600 shadow-xs ring-1 ring-emerald-500/20'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="font-bold text-sm text-stone-900">
                  {language === 'en' ? pref.titleEn : pref.titleHi}
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">{pref.descEn}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex justify-between pt-8 mt-6 border-t border-stone-100">
        <button
          onClick={onBack}
          className="px-5 py-3 border border-stone-300 hover:bg-stone-50 text-stone-700 font-bold text-sm rounded-xl transition-all flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>
        <button
          onClick={onNext}
          className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center space-x-2"
        >
          <span>{t.next}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
