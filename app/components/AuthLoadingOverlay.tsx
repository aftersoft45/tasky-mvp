// app/components/AuthLoadingOverlay.tsx
import React from 'react';
import { ShieldCheck, Lock, CheckCircle } from 'lucide-react';


const VERIFICATION_STEPS = [
  {
    id: 1,
    icon: <CheckCircle size={16} className="text-emerald-600" />,
    text: "Validando identidad con Google OAuth",
    style: "opacity-60",
  },
  {
    id: 2,
    icon: <Lock size={16} />,
    text: "Creando túnel de sesión encriptado",
    style: "animate-pulse text-emerald-400",
  },
  {
    id: 3,
    icon: <div className="w-3.5 h-3.5 rounded-full bg-gray-700" />,
    text: "Redirigiendo al Dashboard",
    style: "opacity-20",
  },
];


const SecuritySpinner = () => (
  <div className="relative flex items-center justify-center w-32 h-32">
    <div className="absolute inset-0 rounded-full border-4 border-dashed border-cyan-800 animate-[spin_10s_linear_infinite]" />
    <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-emerald-500 animate-[spin_1.5s_linear_infinite]" />
    <div className="absolute inset-5 rounded-full border-2 border-transparent border-b-emerald-800 animate-[spin_1s_linear_infinite_reverse]" />
    <div className="relative z-10 p-4 rounded-full bg-[#1d2125] border border-[#30363d] text-emerald-400 animate-pulse">
      <ShieldCheck size={48} strokeWidth={1.5} />
    </div>
  </div>
);

// Componente Principal
export default function AuthLoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#111417]/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="p-10 rounded-3xl bg-[#161a1d] border border-[#30363d] shadow-[0_0_60px_rgba(16,185,129,0.1)] flex flex-col items-center gap-8 relative overflow-hidden">
        
        {/* Resplandor de fondo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />

        <SecuritySpinner />

        {/* Textos de Estado */}
        <div className="text-center space-y-3 z-10 relative">
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center justify-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Estableciendo conexión segura
          </h2>
          
          {/* Mapeo de la lista de verificación */}
          <div className="pt-4 space-y-2 text-sm text-gray-500">
            {VERIFICATION_STEPS.map((step) => (
              <div key={step.id} className={`flex items-center gap-2.5 ${step.style}`}>
                {step.icon} {step.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}