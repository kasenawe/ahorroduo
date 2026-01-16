
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 max-w-md mx-auto relative shadow-xl overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-wallet text-sm"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">AhorroDuo</h1>
        </div>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeTab === 'settings' ? 'bg-slate-100 text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <i className="fas fa-cog"></i>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center safe-bottom z-10">
        <NavButton 
          icon="fas fa-home" 
          label="Resumen" 
          active={activeTab === 'dashboard'} 
          onClick={() => setActiveTab('dashboard')} 
        />
        <NavButton 
          icon="fas fa-plus-circle" 
          label="Gasto" 
          active={activeTab === 'add'} 
          onClick={() => setActiveTab('add')} 
          primary
        />
        <NavButton 
          icon="fas fa-chart-bar" 
          label="Historial" 
          active={activeTab === 'history'} 
          onClick={() => setActiveTab('history')} 
        />
      </nav>
    </div>
  );
};

interface NavButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
  primary?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, primary }) => {
  if (primary) {
    return (
      <button 
        onClick={onClick}
        className="flex flex-col items-center -mt-8 bg-emerald-500 text-white w-14 h-14 rounded-full shadow-lg shadow-emerald-200 justify-center transition-transform active:scale-95"
      >
        <i className={`${icon} text-xl`}></i>
      </button>
    );
  }

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-colors ${active ? 'text-emerald-500' : 'text-slate-400'}`}
    >
      <i className={`${icon} text-lg`}></i>
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
};

export default Layout;
