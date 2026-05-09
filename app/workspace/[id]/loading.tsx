// app/workspace/[id]/loading.tsx
import React from 'react';
import { Target } from 'lucide-react';

export default function LoadingTaskyspace() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#1d2125]">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-500">
        
        {/* Logo animado */}
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-[#161a1d] border border-[#30363d] shadow-[0_0_40px_rgba(16,185,129,0.15)]">
          {/* Anillo giratorio externo */}
          <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-2xl animate-spin"></div>
          {/* Anillo giratorio interno (más rápido) */}
          <div className="absolute inset-2 border-2 border-transparent border-b-cyan-500 rounded-xl animate-[spin_1s_linear_infinite_reverse]"></div>
          
          <Target className="w-8 h-8 text-emerald-400 relative z-10" />
        </div>

        {/* Textos */}
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-white tracking-wide animate-pulse">
            Conectando al Taskyspace
          </h2>
          <div className="flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}