
import React, { useState, useRef } from 'react';
import { Settings as SettingsType, AppState } from '../types';

interface SettingsProps {
  settings: SettingsType;
  fullData: AppState;
  onSave: (settings: SettingsType) => void;
  onImport: (data: AppState) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, fullData, onSave, onImport }) => {
  const [userName, setUserName] = useState(settings.userName);
  const [partnerName, setPartnerName] = useState(settings.partnerName);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({ userName, partnerName });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(fullData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `ahorroduo_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.summaries && json.settings) {
          if (window.confirm('¿Importar copia de seguridad? Esto reemplazará los datos actuales.')) {
            onImport(json);
          }
        } else {
          alert('El archivo no parece ser una copia de seguridad válida de AhorroDuo.');
        }
      } catch (err) {
        alert('Error al leer el archivo de copia de seguridad.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 px-1">Configuración</h2>
      
      {/* Nombres */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
          <i className="fas fa-user-friends text-emerald-500"></i>
          Identidad
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Tu Nombre</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Nombre de tu Pareja</label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg shadow-slate-200 hover:bg-slate-900 transition-colors"
        >
          Guardar Nombres
        </button>
      </div>

      {/* Copia de Seguridad */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
          <i className="fas fa-database text-emerald-500"></i>
          Copia de Seguridad
        </h3>
        
        <p className="text-xs text-slate-500 leading-relaxed">
          Tus datos se guardan solo en este dispositivo. Exporta una copia para no perder tu historial si cambias de móvil.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex flex-col items-center gap-2 bg-emerald-50 text-emerald-700 p-4 rounded-xl font-bold hover:bg-emerald-100 transition-colors"
          >
            <i className="fas fa-download text-xl"></i>
            <span className="text-xs">Exportar</span>
          </button>
          
          <button
            onClick={handleImportClick}
            className="flex flex-col items-center gap-2 bg-slate-50 text-slate-700 p-4 rounded-xl font-bold hover:bg-slate-100 transition-colors"
          >
            <i className="fas fa-upload text-xl"></i>
            <span className="text-xs">Importar</span>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileImport} 
              className="hidden" 
              accept=".json"
            />
          </button>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-8">
        <div className="flex gap-3">
          <i className="fas fa-shield-alt text-blue-500 mt-1"></i>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            AhorroDuo prioriza tu privacidad. No enviamos tus datos financieros a ningún servidor externo para su almacenamiento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
