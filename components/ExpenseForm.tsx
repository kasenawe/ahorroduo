
import React, { useState, useRef } from 'react';
import { Payer, Expense, Settings } from '../types.ts';
import { analyzeReceipt } from '../services/geminiService.ts';

interface ExpenseFormProps {
  onAdd: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
  settings: Settings;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAdd, onCancel, settings }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [payer, setPayer] = useState<Payer>(Payer.USER);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Función para comprimir la imagen antes de enviarla
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024; // Redimensionamos a un tamaño razonable para IA
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('No se pudo crear el contexto del canvas');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Exportamos como JPEG con calidad media para ahorrar datos
          const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
          resolve(base64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) return;
    
    onAdd({
      date: new Date().toISOString(),
      description,
      amount,
      category: 'Comida',
      payer,
      items: items.length > 0 ? items : undefined
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      const compressedBase64 = await compressImage(file);
      const result = await analyzeReceipt(compressedBase64);
      
      if (result) {
        setDescription(result.storeName || 'Compra Supermercado');
        setAmount(result.total || 0);
        setItems(result.items || []);
        // Pequeño feedback visual de éxito
        const successAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        successAudio.volume = 0.2;
        successAudio.play().catch(() => {});
      } else {
        setError("No pudimos leer el ticket. Intenta escribir los datos manualmente o toma otra foto con mejor luz.");
      }
    } catch (err) {
      console.error("Error al procesar:", err);
      setError("Error de conexión o de cámara. Revisa tu internet.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-slideUp">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Nuevo Gasto</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2">
          <i className="fas fa-times"></i>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium flex items-center gap-2 animate-fadeIn">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {!isScanning && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full mb-6 border-2 border-dashed border-emerald-200 bg-emerald-50 text-emerald-700 py-6 rounded-xl font-bold flex flex-col items-center gap-2 hover:bg-emerald-100 transition-colors active:scale-95"
        >
          <i className="fas fa-camera text-3xl"></i>
          <span className="text-sm">Escanear Ticket con IA</span>
          <p className="text-[10px] font-normal text-emerald-600/70">Identifica productos y total automáticamente</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*" 
            capture="environment"
          />
        </button>
      )}

      {isScanning && (
        <div className="w-full mb-6 bg-slate-50 py-10 rounded-xl flex flex-col items-center gap-4 animate-pulse">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">Analizando con IA...</p>
            <p className="text-[10px] text-slate-400 mt-1">Extrayendo precios y productos</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">¿Quién pagó?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPayer(Payer.USER)}
              className={`py-3 rounded-xl font-bold transition-all truncate px-2 border-2 ${payer === Payer.USER ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 border-transparent'}`}
            >
              {settings.userName}
            </button>
            <button
              type="button"
              onClick={() => setPayer(Payer.PARTNER)}
              className={`py-3 rounded-xl font-bold transition-all truncate px-2 border-2 ${payer === Payer.PARTNER ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400 border-transparent'}`}
            >
              {settings.partnerName}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Mercadona, Cena Italiana..."
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Monto Total</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              step="0.01"
              inputMode="decimal"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-slate-50 border-none rounded-xl pl-8 pr-4 py-4 text-slate-800 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-2xl"
              required
            />
          </div>
        </div>

        {items.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
             <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Productos detectados</p>
             <div className="max-h-32 overflow-y-auto space-y-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] text-slate-600">
                    <span className="truncate flex-1"> {item.quantity || 1}x {item.name}</span>
                    <span className="font-bold ml-2">${item.price}</span>
                  </div>
                ))}
             </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isScanning}
          className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all mt-4 active:scale-95 ${isScanning ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-500 text-white shadow-emerald-100'}`}
        >
          {isScanning ? 'Procesando...' : 'Registrar Gasto'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
