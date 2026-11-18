import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { IndianRupee, Leaf } from 'lucide-react';
import { ScoredMaterial } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';

interface CostEcoBarChartProps {
  topRecommendations: ScoredMaterial[];
  language: Language;
}

export const CostEcoBarChart: React.FC<CostEcoBarChartProps> = ({
  topRecommendations,
  language,
}) => {
  const t = DICTIONARY[language];

  const chartData = topRecommendations.map((item) => ({
    name: item.material.shortName,
    costPer1000: item.costPer1000PacksInr,
    costPerPack: item.costPerPackInr,
    co2Footprint: item.material.co2eKgPerKg,
    recyclable: item.material.recyclable,
  }));

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-5 sm:p-6 mb-8">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900 tracking-tight">
              {t.costEcoChartTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'en'
                ? 'Economic batch cost (₹/1000 pouches) vs Embodied Carbon footprint (kg CO₂e/kg)'
                : 'पैकेजिंग लागत (₹/1000 पाउच) बनाम कार्बन फुटप्रिंट'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Bar Chart */}
        <div>
          <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center">
            <IndianRupee className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            Cost per 1,000 Packs (₹ INR)
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" fontSize={11} stroke="#6b7280" tickLine={false} />
                <YAxis unit="₹" fontSize={11} stroke="#6b7280" tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${val}`, 'Cost per 1,000 Packs']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="costPer1000" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CO2e Bar Chart */}
        <div>
          <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center">
            <Leaf className="w-3.5 h-3.5 mr-1 text-teal-600" />
            Embodied Carbon (kg CO₂e / kg material)
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" fontSize={11} stroke="#6b7280" tickLine={false} />
                <YAxis unit=" kg" fontSize={11} stroke="#6b7280" tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`${val} kg CO₂e/kg`, 'Embodied Carbon']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="co2Footprint" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
