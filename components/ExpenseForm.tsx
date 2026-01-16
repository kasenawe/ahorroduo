
import React, { useState, useRef } from 'react';
import { Payer, Expense, Settings } from '../types';
import { analyzeReceipt } from '../services/geminiService';

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
  const [items, setItems] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      const result = await analyzeReceipt(base64);
      
      if (result) {
        setDescription(result.storeName || 'Compra Supermercado');
        setAmount(result.total || 0);
        setItems(result.items || []);
      }
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-slideUp">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Nuevo Gasto</h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <i className="fas fa-times"></i>
        </button>
      </div>

      {!isScanning && (
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="w-full mb-6 border-2 border-dashed border-emerald-200 bg-emerald-50 text-emerald-700 py-4 rounded-xl font-bold flex flex-col items-center gap-2 hover:bg-emerald-100 transition-colors"
        >
          <i className="fas fa-camera text-2xl"></i>
          <span>Escanear Ticket con IA</span>
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
        <div className="w-full mb-6 bg-slate-50 py-10 rounded-xl flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Analizando recibo...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">¿Quién pagó?</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPayer(Payer.USER)}
              className={`py-3 rounded-xl font-bold transition-all truncate px-2 ${payer === Payer.USER ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400'}`}
            >
              {settings.userName}
            </button>
            <button
              type="button"
              onClick={() => setPayer(Payer.PARTNER)}
              className={`py-3 rounded-xl font-bold transition-all truncate px-2 ${payer === Payer.PARTNER ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-400'}`}
            >
              {settings.partnerName}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Descripción</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: Mercadona, Cena, Frutería..."
            className="w-full bg-slate-50 border-none rounded-xl px-4 py-4 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Monto Total</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              value={amount === 0 ? '' : amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="0.00"
              className="w-full bg-slate-50 border-none rounded-xl pl-8 pr-4 py-4 text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-emerald-500 transition-all font-bold text-2xl"
              required
            />
          </div>
        </div>

        {items.length > 0 && (
          <div className="bg-slate-50 p-4 rounded-xl">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Artículos Detectados ({items.length})</h4>
            <div className="max-h-32 overflow-y-auto space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-slate-600 truncate mr-2">{item.name}</span>
                  <span className="font-bold text-slate-800">${item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-100 active:scale-95 transition-all mt-4"
        >
          Registrar Gasto
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
