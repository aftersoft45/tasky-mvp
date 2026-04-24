// app/workspace/loading.tsx
import React from 'react';
import { LayoutGrid, Target, Plus } from 'lucide-react';

export default function LoadingWorkspaceDirectory() {
  // Generamos un arreglo de 6 elementos para simular 6 tarjetas de proyecto
  const skeletonCards = Array.from({ length: 6 });

  return (
    <div className="min-h-screen bg-[#1d2125] p-6 md:p-10 text-[#c9d1d9] font-sans">
      
      {/* --- Header Skeleton --- */}
      <div className="flex items-center justify-between gap-6 pb-8 border-b border-[#30363d]">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8 text-emerald-500 opacity-50" />
            {/* Rectángulo simulando título: Mis Proyectos */}
            <div className="h-8 w-48 bg-[#30363d] rounded animate-pulse"></div>
          </div>
          {/* Rectángulo simulando subtítulo: Bienvenido de nuevo... */}
          <div className="h-4 w-72 bg-[#30363d] rounded mt-3 animate-pulse"></div>
        </div>
        
        {/* Rectángulo simulando Botón: Crear Proyecto */}
        <div className="h-11 w-44 bg-[#30363d] rounded-xl animate-pulse flex items-center gap-2 px-4">
            <Plus size={18} className="text-gray-600"/>
            <div className="h-3 w-20 bg-gray-600 rounded"></div>
        </div>
      </div>

      {/* --- Sección de Grid Skeleton --- */}
      <div className="mt-12 space-y-8">
         <div className="flex items-center gap-2">
             <LayoutGrid size={18} className="text-emerald-600 opacity-60" />
             <div className="h-4 w-40 bg-[#30363d] rounded animate-pulse tracking-wider uppercase text-xs font-bold text-gray-500">Tus Taskyspaces</div>
         </div>

         {/* Grid de Tarjetas Esqueleto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletonCards.map((_, index) => (
            <div
              key={index}
              className="bg-[#161a1d] border border-[#30363d] rounded-3xl p-7 space-y-6 animate-pulse hover:border-emerald-900/50 transition-colors"
            >
              {/* Parte Superior: Iniciales del Proyecto + Info */}
              <div className="flex items-start gap-5">
                {/* Cuadrado grande simulando Iniciales (Ej. CH) */}
                <div className="w-14 h-14 rounded-2xl bg-[#30363d]"></div>
                
                {/* Nombre y Rol Placeholder */}
                <div className="flex-1 space-y-3 pt-1">
                  {/* Nombre del proyecto */}
                  <div className="h-5 w-5/6 bg-[#30363d] rounded"></div>
                  {/* Rol (Admin/Miembro) */}
                  <div className="h-3 w-2/5 bg-[#30363d] rounded"></div>
                </div>
              </div>

              {/* Divisor simulado */}
              <div className="w-full h-px bg-[#30363d]"></div>

              {/* Parte Inferior: Miembros y Fecha */}
              <div className="flex items-center justify-between gap-4 pt-1">
                 {/* Avatares simulados */}
                 <div className="flex -space-x-3">
                     <div className="w-8 h-8 rounded-full bg-[#30363d] border-2 border-[#161a1d]"></div>
                     <div className="w-8 h-8 rounded-full bg-[#30363d] border-2 border-[#161a1d]"></div>
                     <div className="w-8 h-8 rounded-full bg-[#30363d] border-2 border-[#161a1d]"></div>
                 </div>
                 {/* Fecha de creación placeholder */}
                 <div className="h-3 w-1/4 bg-[#30363d] rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}