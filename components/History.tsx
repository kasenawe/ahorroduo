
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MonthlySummary } from '../types.ts';

interface HistoryProps {
  summaries: MonthlySummary[];
}

const History: React.FC<HistoryProps> = ({ summaries }) => {
  const chartData = summaries.map(s => ({
    name: new Date(s.month + '-01').toLocaleDateString('es-ES', { month: 'short' }),
    total: s.totalSpent,
    user: s.userSpent,
    partner: s.partnerSpent,
    rawMonth: s.month
  })).reverse();

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 px-1">Historial</h2>

      {summaries.length === 0 ? (
         <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Aún no hay meses cerrados.</p>
         </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm h-64">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Gasto Total por Mes</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#64748b'}} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#10b981' : '#cbd5e1'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-4">
            <h3 className="text-slate-800 font-bold px-1 text-sm uppercase tracking-tight">Meses Anteriores</h3>
            {summaries.map((s) => (
              <div key={s.month} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-slate-800 capitalize">
                    {new Date(s.month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">
                    {s.expenses.length} gastos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600">${s.totalSpent.toLocaleString()}</p>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Total Mes</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default History;
