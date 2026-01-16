
import React from 'react';
import { MonthlySummary, Payer, Settings } from '../types.ts';

interface DashboardProps {
  summary: MonthlySummary;
  settings: Settings;
  onCloseMonth: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ summary, settings, onCloseMonth }) => {
  const diff = Math.abs(summary.userSpent - summary.partnerSpent);
  const userOwes = summary.userSpent < summary.partnerSpent;

  const currentMonthName = new Date(summary.month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Month Card */}
      <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-100 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm font-medium uppercase tracking-wider">Total Gastado en {currentMonthName}</p>
          <h2 className="text-4xl font-bold mt-1">${summary.totalSpent.toLocaleString()}</h2>
          
          <div className="mt-8 flex justify-between gap-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex-1 border border-white/10">
              <p className="text-emerald-100 text-[10px] uppercase font-bold truncate">{settings.userName}</p>
              <p className="text-lg font-bold">${summary.userSpent.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 flex-1 border border-white/10">
              <p className="text-emerald-100 text-[10px] uppercase font-bold truncate">{settings.partnerName}</p>
              <p className="text-lg font-bold">${summary.partnerSpent.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Balance Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-tight">
          <i className="fas fa-balance-scale text-emerald-500"></i>
          Ajuste de Cuentas
        </h3>
        
        {diff === 0 ? (
          <div className="text-center py-4">
            <p className="text-slate-500 text-sm italic">¡Todo está cuadrado!</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${userOwes ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                <i className={`fas ${userOwes ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
              </div>
              <div>
                <p className="text-[11px] text-slate-500 font-bold uppercase">
                  {userOwes ? `${settings.userName} debe` : `A ${settings.userName} le deben`}
                </p>
                <p className="text-xl font-bold text-slate-800">${(diff / 2).toLocaleString()}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400 uppercase font-bold">Base 50/50</p>
            </div>
          </div>
        )}
      </div>

      {/* Last Expenses */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-slate-800 font-bold text-sm uppercase tracking-tight">Gastos del mes</h3>
          <span className="text-[10px] text-slate-400 uppercase font-bold">{summary.expenses.length} Movimientos</span>
        </div>

        {summary.expenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">Empieza a registrar gastos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {summary.expenses.slice().reverse().map((expense) => (
              <div key={expense.id} className="bg-white rounded-xl p-4 border border-slate-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${expense.payer === Payer.USER ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'}`}>
                    <i className="fas fa-shopping-cart text-sm"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 truncate max-w-[150px]">{expense.description}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Pagado por {expense.payer === Payer.USER ? settings.userName : settings.partnerName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">${expense.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    {new Date(expense.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button 
        onClick={onCloseMonth}
        className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-900 transition-colors mt-4 active:scale-95"
      >
        <i className="fas fa-lock mr-2"></i>
        Cerrar Mes y Liquidar
      </button>
    </div>
  );
};

export default Dashboard;
