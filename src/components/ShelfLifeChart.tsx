import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Clock, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { ScoredMaterial, ShelfLifeCurvePoint } from '../engine/types';
import { Language, DICTIONARY } from '../data/i18n';

interface ShelfLifeChartProps {
  shelfLifeCurve: ShelfLifeCurvePoint[];
  topRecommendations: ScoredMaterial[];
  desiredShelfLifeDays: number;
  language: Language;
}

const LINE_COLORS = ['#059669', '#0284c7', '#d97706'];

export const ShelfLifeChart: React.FC<ShelfLifeChartProps> = ({
  shelfLifeCurve,
  topRecommendations,
  desiredShelfLifeDays,
  language,
}) => {
  const t = DICTIONARY[language];
  const top1 = topRecommendations[0];

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 p-5 sm:p-6 mb-8">
      {/* Header with Spoilage Reduction Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-stone-100 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-stone-900 tracking-tight">
              {t.shelfLifeChartTitle}
            </h3>
            <p className="text-xs text-stone-500">
              {language === 'en'
                ? 'Arrhenius Q10 temperature-dependent degradation kinetics'
                : 'तापमान व बैरियर अनुरूप शेल्फ-लाइफ भविष्यवाणी'}
            </p>
          </div>
        </div>

        {/* Spoilage Reduction Metric Badge */}
        {top1 && (
          <div className="bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-xl flex items-center space-x-2 self-start sm:self-auto">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            <div className="text-xs">
              <span className="text-stone-500">
                {language === 'en' ? 'Spoilage Reduction: ' : 'नुकसान कमी: '}
              </span>
              <span className="font-black text-emerald-800 text-sm">
                ~{top1.spoilageReductionPct}%
              </span>
              <span className="text-[10px] text-stone-400 block sm:inline sm:ml-1">
                (vs raw baseline)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Target Met vs Desired Shelf-Life Quick Badges for Top 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {topRecommendations.map((item, idx) => (
          <div
            key={item.material.id}
            className={`p-3 rounded-xl border flex items-center justify-between ${
              item.meetsShelfLifeTarget
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-rose-50/50 border-rose-200'
            }`}
          >
            <div>
              <div className="font-bold text-xs text-stone-900 truncate max-w-[140px]">
                #{idx + 1} {item.material.shortName}
              </div>
              <div className="text-xs font-black text-stone-900 mt-0.5">
                {item.predictedShelfLifeDays}{' '}
                <span className="font-normal text-stone-500 text-[11px]">
                  {language === 'en' ? 'days' : 'दिन'}
                </span>
              </div>
            </div>
            <div className="text-right">
              {item.meetsShelfLifeTarget ? (
                <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  {language === 'en' ? 'Meets Target' : 'लक्ष्य पूर्ण'}
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                  <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                  {language === 'en' ? 'Below Target' : 'कम'}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recharts Curve */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={shelfLifeCurve} margin={{ top: 10, right: 25, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="temp"
              unit="°C"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              unit=" d"
              stroke="#6b7280"
              fontSize={11}
              tickLine={false}
              domain={[0, 'auto']}
            />
            <Tooltip
              formatter={(val: any, name: any) => [`${val} days`, name]}
              labelFormatter={(label) => `Storage Temperature: ${label}°C`}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
              iconType="circle"
            />
            <ReferenceLine
              y={desiredShelfLifeDays}
              stroke="#dc2626"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `Target: ${desiredShelfLifeDays}d`,
                fill: '#dc2626',
                fontSize: 10,
                position: 'insideTopRight',
              }}
            />
            {topRecommendations.map((r, idx) => (
              <Line
                key={r.material.shortName}
                type="monotone"
                dataKey={r.material.shortName}
                stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                strokeWidth={2.5}
                dot={{ r: 3, fill: LINE_COLORS[idx % LINE_COLORS.length] }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 text-[11px] text-stone-400 italic">
        * Red dashed reference line represents your desired shelf-life target of {desiredShelfLifeDays} days.
        Kinetic model accounts for temperature activation energy and polymeric barrier integrity.
      </div>
    </div>
  );
};
