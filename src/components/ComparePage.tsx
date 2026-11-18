import React, { useState } from 'react';
import { Scale, Check, X, Shield, Leaf, IndianRupee, Layers, Info } from 'lucide-react';
import { MATERIALS, PackagingMaterial } from '../data/materials';
import { Language, DICTIONARY } from '../data/i18n';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface ComparePageProps {
  language: Language;
}

export const ComparePage: React.FC<ComparePageProps> = ({ language }) => {
  const t = DICTIONARY[language];
  // Default selection: Met-PET/LDPE vs PLA vs LDPE
  const [selectedIds, setSelectedIds] = useState<string[]>([
    'met-pet-ldpe',
    'pla',
    'ldpe',
  ]);

  const toggleMaterial = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      } else {
        // Replace the last item
        setSelectedIds([selectedIds[0], selectedIds[1], id]);
      }
    }
  };

  const selectedMaterials = MATERIALS.filter((m) => selectedIds.includes(m.id));

  // Radar metrics
  const radarData = [
    {
      metric: language === 'en' ? 'Moisture Barrier (1/WVTR)' : 'नमी अवरोधक',
      ...selectedMaterials.reduce((acc, m) => {
        acc[m.shortName] = Math.max(10, Math.min(100, Math.round(100 - Math.log10(m.wvtr + 0.1) * 30)));
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: language === 'en' ? 'Gas Barrier (1/OTR)' : 'गैस अवरोधक',
      ...selectedMaterials.reduce((acc, m) => {
        acc[m.shortName] = Math.max(10, Math.min(100, Math.round(100 - Math.log10(m.otr + 0.1) * 20)));
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: language === 'en' ? 'Tensile Strength' : 'यांत्रिक मजबूती',
      ...selectedMaterials.reduce((acc, m) => {
        acc[m.shortName] = Math.min(100, Math.round((m.tensileStrengthMpa / 180) * 100));
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: language === 'en' ? 'Eco & Recyclability' : 'पर्यावरण प्रभाव',
      ...selectedMaterials.reduce((acc, m) => {
        const bio = m.biodegradable ? 50 : 0;
        const rec = m.recyclable === 'yes' ? 40 : m.recyclable === 'compostable' ? 45 : 15;
        acc[m.shortName] = bio + rec;
        return acc;
      }, {} as Record<string, number>),
    },
    {
      metric: language === 'en' ? 'Cost Affordability' : 'लागत सुलभता',
      ...selectedMaterials.reduce((acc, m) => {
        acc[m.shortName] = Math.max(10, Math.round(100 - (m.costPerM2 / 24) * 80));
        return acc;
      }, {} as Record<string, number>),
    },
  ];

  const RADAR_COLORS = ['#059669', '#0284c7', '#d97706'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6 sm:p-7">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {t.compareTitle}
            </h1>
            <p className="text-xs sm:text-sm text-stone-500">{t.compareSubtitle}</p>
          </div>
        </div>

        {/* Material Selection Chips */}
        <div className="mt-5 pt-4 border-t border-stone-100">
          <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
            Select 2 to 3 Materials to Compare ({selectedIds.length}/3 selected):
          </div>
          <div className="flex flex-wrap gap-2">
            {MATERIALS.map((mat) => {
              const isSelected = selectedIds.includes(mat.id);
              return (
                <button
                  key={mat.id}
                  onClick={() => toggleMaterial(mat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{mat.shortName}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-extrabold text-base text-stone-900">
            Technical Properties & Barrier Matrix
          </h2>
          <span className="text-xs text-stone-500 italic">{t.indicativeNote}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-stone-50/80 text-stone-600 font-bold border-b border-stone-200">
                <th className="p-3.5 sm:p-4 w-1/4">Specification Parameter</th>
                {selectedMaterials.map((m, idx) => (
                  <th key={m.id} className="p-3.5 sm:p-4 w-1/4 font-extrabold text-stone-900">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                      style={{ backgroundColor: RADAR_COLORS[idx] }}
                    />
                    {m.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  Reference Thickness (µm)
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4 font-bold text-stone-900">
                    {m.refThicknessUm} µm
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  WVTR (g/m²/day @ 38°C 90%RH)
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4 font-extrabold text-blue-900">
                    {m.wvtr} <span className="font-normal text-xs text-stone-400">g/m²·d</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  OTR (cc/m²/day @ 23°C 0%RH)
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4 font-extrabold text-sky-900">
                    {m.otr} <span className="font-normal text-xs text-stone-400">cc/m²·d</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  Tensile Strength (MPa)
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4 text-stone-800">
                    {m.tensileStrengthMpa} MPa
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  Heat Sealability
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4">
                    {m.heatSealable ? (
                      <span className="text-emerald-700 font-bold inline-flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" /> Yes
                      </span>
                    ) : (
                      <span className="text-rose-600 font-bold inline-flex items-center">
                        <X className="w-3.5 h-3.5 mr-1" /> Needs Sealant
                      </span>
                    )}
                    <span className="block text-[11px] text-stone-500 mt-0.5">{m.heatSealNote}</span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  Cost (₹ / m²)
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4 font-black text-stone-900">
                    ₹{m.costPerM2}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  Recyclability
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4">
                    <span className="font-bold text-stone-900 capitalize">{m.recyclable}</span>
                    <span className="block text-[11px] text-stone-500">
                      Code: {m.recyclingCode || 'N/A'}
                    </span>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  Biodegradability
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4">
                    {m.biodegradable ? (
                      <span className="text-emerald-700 font-bold inline-flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" /> Yes (Compostable)
                      </span>
                    ) : (
                      <span className="text-stone-500">No</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  Carbon Footprint (kg CO₂e/kg)
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4 font-bold text-stone-900">
                    {m.co2eKgPerKg} kg
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  Light Barrier
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4">
                    {m.lightBarrier ? (
                      <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded text-xs">
                        Opaque / Foil
                      </span>
                    ) : (
                      <span className="text-stone-500 text-xs">Transparent</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-bold text-stone-700 bg-stone-50/40">
                  Cold-Crack Resistance
                </td>
                {selectedMaterials.map((m) => (
                  <td key={m.id} className="p-3.5 sm:p-4">
                    {m.coldCrackResistant ? (
                      <span className="text-blue-800 font-bold text-xs">
                        Sub-zero safe (-25°C)
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs">Ambient only</span>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Radar Overlay */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-6">
        <h3 className="font-extrabold text-base text-stone-900 mb-1">
          Comparative Radar Overlay
        </h3>
        <p className="text-xs text-stone-500 mb-4">
          Visual trade-off comparison between the selected materials across moisture, gas, strength, eco, and affordability.
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '0.75rem',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
              {selectedMaterials.map((m, idx) => (
                <Radar
                  key={m.shortName}
                  name={m.shortName}
                  dataKey={m.shortName}
                  stroke={RADAR_COLORS[idx]}
                  fill={RADAR_COLORS[idx]}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
