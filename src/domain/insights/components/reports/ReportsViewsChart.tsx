import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { InteractionHistoryItem } from '../../types/interaction';

interface ReportsViewsChartProps {
  history: InteractionHistoryItem[];
}

export function ReportsViewsChart({ history }: ReportsViewsChartProps) {
  const { t } = useTranslation();
  const lastIndex = history.length - 1;

  return (
    <div className="glassmorphism rounded-[2rem] p-8 border border-white/5 overflow-hidden">
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white tracking-wide">
          {t('insights.chart.title')}
        </h4>
        <p className="text-[10px] text-white/60 font-medium tracking-wide">
          {t('insights.chart.subtitle')}
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={history}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 700 }}
              dy={10}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
              itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 600 }}
              labelStyle={{ color: 'rgba(255,255,255,0.6)', fontSize: '9px', fontWeight: 500 }}
            />
            <Bar dataKey="views" name={t('insights.chart.series')} radius={[6, 6, 0, 0]}>
              {history.map((entry, index) => (
                <Cell
                  key={entry.date}
                  fill={index === lastIndex ? '#F59E0B' : 'rgba(245, 158, 11, 0.3)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
