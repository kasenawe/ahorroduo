
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
          text: 'Te envío mis últimos gastos actualizados.'
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    } else {
      alert('Tu navegador no permite compartir archivos directamente. Usa el botón de "Exportar Archivo".');
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
          if (window.confirm('¿Importar datos? Esto reemplazará tu historial actual con el que has recibido.')) {
            onImport(json);
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
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-slate-800 px-1">Configuración</h2>
      
      {/* Nombres */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
          <i className="fas fa-user-friends text-emerald-500"></i>
          Nombres en la App
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Tu Nombre</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 ml-1">Tu Pareja</label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-slate-800 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-900 transition-colors"
        >
          Actualizar Nombres
        </button>
      </div>

      {/* Sincronización con Pareja */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase flex items-center gap-2">
          <i className="fas fa-sync text-emerald-500"></i>
          Sincronizar con pareja
        </h3>
        
        <p className="text-xs text-slate-500 leading-relaxed">
          Para unir vuestros gastos, envíale tus datos por WhatsApp y ella deberá "Cargar" el archivo que reciba.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleShare}
            className="flex flex-col items-center gap-2 bg-emerald-500 text-white p-4 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-md"
          >
            <i className="fab fa-whatsapp text-xl"></i>
            <span className="text-xs">Enviar Datos</span>
          </button>
          
          <button
            onClick={handleImportClick}
            className="flex flex-col items-center gap-2 bg-slate-800 text-white p-4 rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-md"
          >
            <i className="fas fa-file-import text-xl"></i>
            <span className="text-xs">Cargar Datos</span>
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

      <div className="bg-slate-100 rounded-2xl p-4 flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase">Copia de Seguridad</span>
        <button onClick={handleExport} className="text-emerald-600 font-bold text-xs">Descargar JSON</button>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mb-8">
        <div className="flex gap-3">
          <i className="fas fa-info-circle text-blue-500 mt-1"></i>
          <p className="text-[11px] text-blue-700 leading-relaxed">
            Al no usar una base de datos centralizada, vuestra privacidad es total. Los datos solo se mueven cuando tú decides compartirlos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
