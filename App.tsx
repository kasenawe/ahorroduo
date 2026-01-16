
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Dashboard from './components/Dashboard.tsx';
import History from './components/History.tsx';
import ExpenseForm from './components/ExpenseForm.tsx';
import Settings from './components/Settings.tsx';
import { AppState, MonthlySummary, Expense, Payer, Settings as SettingsType } from './types.ts';

const STORAGE_KEY = 'ahorro_duo_data_v1';

const getCurrentMonthStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, setState] = useState<AppState>(() => {
    const currentMonth = getCurrentMonthStr();
    const defaultState: AppState = {
      summaries: [
        {
          month: currentMonth,
          totalSpent: 0,
          userSpent: 0,
          partnerSpent: 0,
          isClosed: false,
          expenses: []
        }
      ],
      currentMonth: currentMonth,
      settings: {
        userName: 'Yo',
        partnerName: 'Pareja'
      }
    };

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.settings) return parsed;
      }
    } catch (e) {
      console.warn("LocalStorage no disponible:", e);
    }
    return defaultState;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("No se pudo guardar en LocalStorage:", e);
    }
  }, [state]);

  const currentSummary = state.summaries.find(s => s.month === state.currentMonth && !s.isClosed) 
    || state.summaries[0];

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: Math.random().toString(36).substr(2, 9)
    };

    setState(prev => {
      const updatedSummaries = prev.summaries.map(s => {
        if (s.month === prev.currentMonth && !s.isClosed) {
          const updatedExpenses = [...s.expenses, newExpense];
          return {
            ...s,
            expenses: updatedExpenses,
            totalSpent: updatedExpenses.reduce((acc, e) => acc + e.amount, 0),
            userSpent: updatedExpenses.filter(e => e.payer === Payer.USER).reduce((acc, e) => acc + e.amount, 0),
            partnerSpent: updatedExpenses.filter(e => e.payer === Payer.PARTNER).reduce((acc, e) => acc + e.amount, 0)
          };
        }
        return s;
      });
      return { ...prev, summaries: updatedSummaries };
    });
    setActiveTab('dashboard');
  };

  const handleUpdateSettings = (newSettings: SettingsType) => {
    setState(prev => ({ ...prev, settings: newSettings }));
    setActiveTab('dashboard');
  };

  const handleImportState = (newState: AppState) => {
    setState(newState);
    setActiveTab('dashboard');
  };

  const handleCloseMonth = () => {
    if (window.confirm('¿Estás seguro de cerrar el mes?')) {
      setState(prev => {
        const updatedSummaries = prev.summaries.map(s => {
          if (s.month === prev.currentMonth) return { ...s, isClosed: true };
          return s;
        });
        
        const [year, month] = prev.currentMonth.split('-').map(Number);
        const nextDate = new Date(year, month, 1);
        const nextMonthStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;

        const newMonth: MonthlySummary = {
          month: nextMonthStr,
          totalSpent: 0,
          userSpent: 0,
          partnerSpent: 0,
          isClosed: false,
          expenses: []
        };

        return {
          ...prev,
          summaries: [newMonth, ...updatedSummaries],
          currentMonth: nextMonthStr
        };
      });
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {activeTab === 'dashboard' && (
        <Dashboard 
          summary={currentSummary} 
          settings={state.settings}
          onCloseMonth={handleCloseMonth}
        />
      )}
      {activeTab === 'add' && (
        <ExpenseForm 
          onAdd={handleAddExpense} 
          onCancel={() => setActiveTab('dashboard')} 
          settings={state.settings}
        />
      )}
      {activeTab === 'history' && (
        <History 
          summaries={state.summaries.filter(s => s.isClosed)} 
        />
      )}
      {activeTab === 'settings' && (
        <Settings 
          settings={state.settings} 
          fullData={state}
          onSave={handleUpdateSettings} 
          onImport={handleImportState}
        />
      )}
    </Layout>
  );
};

export default App;
