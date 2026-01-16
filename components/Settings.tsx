
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

  const handleShare = async () => {
    const dataStr = JSON.stringify(fullData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const file = new File([blob], `ahorroduo_sync_${new Date().toISOString().split('T')[0]}.json`, { type: 'application/json' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Sincronización AhorroDuo',
          text: `Mis gastos de AhorroDuo al día ${new Date().toLocaleDateString()}`
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    } else {
      handleExport();
    }
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
          if (window.confirm('¿Importar datos? Esto unificará tu historial con el de tu pareja.')) {
            onImport({ ...json, lastSync: new Date().toISOString() });
          }
        } else {
          alert('El archivo no parece ser válido.');
        }
      } catch (err) {
        alert('Error al leer el archivo.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <h2 className="text-2xl font-bold text-slate-800 px-1">Configuración</h2>
      
      {/* Nombres */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
          <i className="fas fa-user-friends text-emerald-500"></i>
          Perfiles
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Tú</label>
               <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
            <div className="flex-1">
               <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Pareja</label>
               <input
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors"
          >
            Guardar Nombres
          </button>
        </div>
      </div>

      {/* Sincronización Manual */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
            <i className="fas fa-sync text-emerald-500"></i>
            Sincronización
          </h3>
          {fullData.lastSync && (
            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full font-bold">
              Última: {new Date(fullData.lastSync).toLocaleDateString()}
            </span>
          )}
        </div>
        
        <p className="text-xs text-slate-500 leading-relaxed">
          Usa estos botones para mantener vuestros gastos unidos. Uno envía y el otro carga.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 bg-emerald-500 text-white p-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-md active:scale-95"
          >
            <i className="fab fa-whatsapp text-2xl"></i>
            <span className="text-xs">Enviar mis datos</span>
          </button>
          
          <button
            onClick={handleImportClick}
            className="flex flex-col items-center gap-2 bg-slate-800 text-white p-4 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-md active:scale-95"
          >
            <i className="fas fa-cloud-download-alt text-2xl"></i>
            <span className="text-xs">Cargar de pareja</span>
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

      <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 mb-8">
        <div className="flex gap-3">
          <i className="fas fa-shield-alt text-blue-500 mt-1"></i>
          <div>
            <p className="text-[11px] font-bold text-blue-800 mb-1">Privacidad Total</p>
            <p className="text-[10px] text-blue-700 leading-tight">
              Tus finanzas no se guardan en ningún servidor externo. Solo tú controlas quién ve tus datos compartiendo el archivo.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
