import React from 'react';
import {type ReconciliationSummary } from '../types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export const DiscrepancyCharts: React.FC<{ summary: ReconciliationSummary }> = ({ summary }) => {
  const chartData = summary.typeBreakdown || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="text-base font-bold text-slate-800 mb-4">Discrepancy Volume Breakdown</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="type"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col">
        <h3 className="text-base font-bold text-slate-800 mb-4">Financial Risk by Category ($ USD)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="type" angle={-15} textAnchor="end" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(val) => `$${val}`} />
              <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount at Risk']} />
              <Bar dataKey="amountAtRisk" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};