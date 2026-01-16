
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
  const [scanStatus, setScanStatus] = useState<'idle' | 'compressing' | 'analyzing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const scale = MAX_WIDTH / img.width;
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Canvas context error'));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
          resolve(base64);
        };
        img.onerror = () => reject(new Error('Error al cargar imagen. Intenta otra foto.'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo del móvil.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setScanStatus('compressing');

    try {
      const compressedBase64 = await compressImage(file);
      setScanStatus('analyzing');
      
      const result = await analyzeReceipt(compressedBase64);
      
      if (result) {
        setDescription(result.storeName || 'Compra General');
        setAmount(result.total || 0);
        setItems(result.items || []);
      } else {
        setError("La IA no pudo procesar la imagen. Asegúrate de que el ticket se vea claro.");
      }
    } catch (err: any) {
      console.error("Error en escaneo:", err);
      setError(err.message || "Error al conectar con el servicio de IA.");
    } finally {
      setScanStatus('idle');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isScanning = scanStatus !== 'idle';

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-slideUp">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Nuevo Gasto</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 p-2">
          <i className="fas fa-times"></i>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium flex items-start gap-2 border border-red-100">
          <i className="fas fa-exclamation-circle mt-0.5"></i>
          <span>{error}</span>
        </div>
      )}

      {!isScanning && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full mb-6 border-2 border-dashed border-emerald-200 bg-emerald-50 text-emerald-700 py-10 rounded-xl font-bold flex flex-col items-center gap-2 hover:bg-emerald-100 active:scale-95 transition-all"
        >
          <i className="fas fa-camera text-4xl mb-1"></i>
          <span className="text-sm">Tomar Foto del Ticket</span>
          <p className="text-[10px] font-normal opacity-70">Detecta productos y totales automáticamente</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept="image/*"
          />
        </button>
      )}

      {isScanning && (
        <div className="w-full mb-6 bg-slate-50 py-12 rounded-xl flex flex-col items-center gap-4 animate-pulse border-2 border-emerald-100">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">
              {scanStatus === 'compressing' ? 'Preparando foto...' : 'La IA está leyendo el ticket...'}
            </p>
            <p className="text-[10px] text-slate-400 mt-1">Por favor, no cierres la app</p>
          </div>
        </div>
      )}

      <form onSubmit={(e) => {
        e.preventDefault();
        onAdd({
          date: new Date().toISOString(),
          description,
          amount,
          category: 'Varios',
          payer,
          items: items.length > 0 ? items : undefined
        });
      }} className="space-y-5">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">¿Quién pagó?</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: Payer.USER, name: settings.userName },
              { id: Payer.PARTNER, name: settings.partnerName }
            ].map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPayer(p.id)}
                className={`py-3 rounded-xl font-bold transition-all border-2 ${payer === p.id ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-slate-50 text-slate-400 border-transparent'}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Carrefour, Cena..."
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2 ml-1">Total</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              step="0.01"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-slate-50 border-none rounded-xl pl-8 pr-4 py-4 text-slate-800 font-bold text-2xl focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isScanning}
          className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all ${isScanning ? 'bg-slate-300' : 'bg-emerald-500 text-white shadow-emerald-100 active:scale-95'}`}
        >
          {isScanning ? 'Procesando...' : 'Registrar Gasto'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
