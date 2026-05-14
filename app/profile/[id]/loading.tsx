// app/profile/[id]/loading.tsx

// componente que se muestra mientras cargan los datos del perfil público de un usuario
import React from 'react';
import { Mail, Calendar } from 'lucide-react';
//
export default function LoadingProfile() {
  return (
    <div className="min-h-screen bg-[#1d2125] text-[#c9d1d9] font-sans p-6 md:p-10 flex justify-center items-start pt-20">
      
      <div className="w-full max-w-3xl bg-[#161a1d] border border-[#30363d] rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 animate-pulse">
          
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#22272b] border-4 border-[#1d2125] shadow-lg shrink-0"></div>

          <div className="flex-1 space-y-6 w-full text-center md:text-left pt-2">
            
            {/* Nombre y Rol */}
            <div>
              <div className="h-8 w-3/4 max-w-[250px] bg-[#30363d] rounded-lg mb-3 mx-auto md:mx-0"></div>
              <div className="h-4 w-1/2 max-w-[150px] bg-[#22272b] rounded mx-auto md:mx-0"></div>
            </div>

            {/* Datos de contacto */}
            <div className="space-y-4 pt-6 border-t border-[#30363d]/50">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div className="h-4 w-48 bg-[#22272b] rounded"></div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div className="h-4 w-32 bg-[#22272b] rounded"></div>
              </div>
            </div>

            {/* Boton de editar*/}
            <div className="pt-6 flex justify-center md:justify-start">
              <div className="h-10 w-32 bg-[#2c333b] rounded-lg border border-[#30363d]"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}