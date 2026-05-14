// app/profile/[id]/PublicProfileClient.tsx
'use client';

// renderiza el perfil publico del usuario
// permite mostrar avatar, datos basicos, edicion de perfil
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, Edit3, User as UserIcon } from 'lucide-react';
import UserProfileMenu from '../../components/UserProfileMenu';

interface PublicProfileClientProps {
  targetUser: any;
  currentUser: any;
  isOwnProfile: boolean;
}

export default function PublicProfileClient({ targetUser, currentUser, isOwnProfile }: PublicProfileClientProps) {
  const router = useRouter();

  const joinDate = new Date(targetUser.createdAt).toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#1d2125] text-[#c9d1d9] font-sans flex flex-col relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <header className="h-16 flex items-center justify-between px-6 border-b border-[#30363d] bg-[#161a1d]/80 backdrop-blur-md relative z-50 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-emerald-400 transition-colors mr-2">
            <ArrowLeft size={20} />
          </button>
          <div className="bg-[#1d2125] p-1.5 rounded-lg border border-[#30363d]">
            <UserIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="font-bold text-white text-lg">Perfil de Usuario</span>
        </div>
        <UserProfileMenu user={currentUser} />
      </header>

      {/* contenido del perfil*/}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        
        <div className="w-full max-w-2xl bg-[#161a1d] border border-[#30363d] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-500">
          
          <div className="h-32 bg-gradient-to-r from-emerald-900/40 via-cyan-900/40 to-purple-900/40 relative border-b border-[#30363d]">
            {isOwnProfile && (
              <Link href="/profile" className="absolute top-4 right-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Edit3 size={16} /> Editar mi perfil
              </Link>
            )}
          </div>

          <div className="px-8 pb-10 relative">
            
            <div className="flex justify-between items-end -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-[#161a1d] bg-[#1d2125] flex items-center justify-center text-4xl font-bold text-emerald-400 shadow-xl overflow-hidden relative z-10">
                {targetUser.image ? (
                  <img src={targetUser.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  targetUser.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </div>

            {/* Informacion del Usuario */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{targetUser.name}</h1>
                <p className="text-emerald-400 font-medium mt-1">Miembro de Tasky</p>
              </div>

              <div className="h-px w-full bg-[#30363d]"></div>

              <div className="grid gap-4">
                <div className="flex items-center gap-4 text-gray-300 bg-[#1d2125] p-4 rounded-xl border border-[#30363d]">
                  <div className="bg-[#161a1d] p-2 rounded-lg text-gray-500">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Contacto</p>
                    <p className="font-medium">{targetUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-gray-300 bg-[#1d2125] p-4 rounded-xl border border-[#30363d]">
                  <div className="bg-[#161a1d] p-2 rounded-lg text-gray-500">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Se unió en</p>
                    <p className="font-medium capitalize">{joinDate}</p>
                  </div>
                </div>
              </div>
              
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}