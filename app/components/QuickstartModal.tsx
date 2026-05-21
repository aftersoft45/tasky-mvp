// app/components/QuickstartModal.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom'; // <-- Importamos la herramienta de portales
import { X, Rocket, LayoutGrid, User, BookOpen, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface QuickstartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickstartModal({ isOpen, onClose }: QuickstartModalProps) {
  // Estado para asegurarnos de que el navegador ya cargó antes de "teletransportar"
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Si no está abierto o no ha cargado la página, no mostramos nada
  if (!isOpen || !mounted) return null;

  const quickActions = [
    {
      title: 'Crear un Proyecto',
      description: 'Inicia un nuevo Taskyspace y organiza a tu equipo.',
      icon: <LayoutGrid className="text-emerald-400" size={24} />,
      href: '/workspace',
    },
    {
      title: 'Configurar Perfil',
      description: 'Personaliza tu avatar, nombre y credenciales.',
      icon: <User className="text-cyan-400" size={24} />,
      href: '/profile',
    },
    {
      title: 'Ver Tutoriales',
      description: 'Domina los atajos y exprime al máximo la plataforma.',
      icon: <BookOpen className="text-purple-400" size={24} />,
      href: '#', 
    }
  ];

  // Todo este contenido es el que mandaremos al <body>
  const modalContent = (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
      
      <div className="bg-[#1d2125] border border-[#30363d] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-black relative animate-in zoom-in-95 duration-300">
        
        {/* Barra superior estilo neón */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-500"></div>

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-[#30363d] bg-[#161a1d] relative overflow-hidden">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="bg-[#1d2125] p-2 rounded-xl border border-[#30363d] shadow-inner">
              <Rocket className="text-emerald-400 animate-pulse" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Quickstart</h2>
              <p className="text-sm text-gray-400">Atajos rápidos para dominar Tasky.</p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-white bg-[#1d2125] p-2 rounded-lg border border-[#30363d] transition-colors relative z-10"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENIDO (Tarjetas de acción) */}
        <div className="p-6 md:p-8 bg-[#1d2125]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {quickActions.map((action, idx) => (
              <Link 
                href={action.href} 
                key={idx}
                onClick={onClose}
                className="group relative bg-[#161a1d] border border-[#30363d] hover:border-emerald-500/50 rounded-xl p-5 transition-all hover:-translate-y-1 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col h-full overflow-hidden"
              >
                {/* Resplandor interno de la tarjeta en hover */}
                <div className="absolute -inset-2 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="bg-[#1d2125] w-12 h-12 rounded-lg border border-[#30363d] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10">
                  {action.icon}
                </div>
                
                <h3 className="text-white font-bold mb-2 relative z-10 group-hover:text-emerald-400 transition-colors">{action.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed flex-1 relative z-10">{action.description}</p>
                
                <div className="mt-4 pt-4 border-t border-[#30363d] flex items-center justify-between relative z-10">
                  <span className="text-xs font-medium text-gray-500 group-hover:text-emerald-400 transition-colors">Empezar</span>
                  <ArrowRight size={16} className="text-gray-600 group-hover:text-emerald-400 transform group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}

          </div>
        </div>
      </div>
    </div>
  );

 
  return createPortal(modalContent, document.body);
}