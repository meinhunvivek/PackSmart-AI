import React from 'react';
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
import { Compass } from 'lucide-react';
import { ScoredMaterial } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';

interface RadarComparisonChartProps {
  topRecommendations: ScoredMaterial[];
  language: Language;
}

const RADAR_COLORS = [
  { stroke: '#059669', fill: '#059669' },
  { stroke: '#0284c7', fill: '#0284c7' },
  { stroke: '#d97706', fill: '#d97706' },
];

export const RadarComparisonChart: React.FC<RadarComparisonChartProps> = ({
  topRecommendations,
  language,
}) => {
  const t = DICTIONARY[language];

  // Construct data across 5 dimensions: Barrier, Strength, Cost Economy, Eco, Logistics
  const radarDimensions = [
    {
      dimension: language === 'en' ? 'Barrier Protection' : 'बैरियर सुरक्षा',
      key: 'barrierFit',
    },
    {
      dimension: language === 'en' ? 'Mechanical Strength' : 'यांत्रिक मजबूती',
      key: 'mechFit',
    },
    {
      dimension: language === 'en' ? 'Cost Economy' : 'किफायती लागत',
      key: 'costScore',
    },
    {
      dimension: language === 'en' ? 'Eco & Recyclability' : 'पर्यावरण व स्थिरता',
      key: 'ecoScore',
    },
    {
      dimension: language === 'en' ? 'Logistics Endurance' : 'परिवहन सहनशीलता',
      key: 'transportFit',
    },
  ];

  const chartData = radarDimensions.map((dim) => {
    const point: Record<string, any> = { dimension: dim.dimension };
    topRecommendations.forEach((item) => {
      point[item.material.shortName] = (item as any)[dim.key] ?? 50;
    });
    return point;
  });

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-5 sm:p-6 mb-8">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900 tracking-tight">
              {t.radarChartTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'en'
                ? '5-axis comparative evaluation across top recommended candidates'
                : 'शीर्ष अनुशंसित सामग्रियों का 5-धुरीय प्रदर्शन विश्लेषण'}
            </p>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#374151', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} iconType="circle" />
            {topRecommendations.map((item, idx) => {
              const color = RADAR_COLORS[idx % RADAR_COLORS.length];
              return (
                <Radar
                  key={item.material.shortName}
                  name={item.material.shortName}
                  dataKey={item.material.shortName}
                  stroke={color.stroke}
                  fill={color.fill}
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              );
            })}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
