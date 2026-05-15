'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Calendar, Edit3, User as UserIcon, ListTodo, Clock, CheckCircle, AlertCircle, Layout } from 'lucide-react';
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

  // Agrupamos los tickets por estado usando la data de Prisma
  const tasks = targetUser.assignedTasks || [];
  const stats = {
    todo: tasks.filter((t: any) => ['POR HACER', 'BACKLOG'].includes(t.column?.title?.toUpperCase())).length,
    doing: tasks.filter((t: any) => ['EN CURSO', 'PROGRESS', 'EN REVISIÓN', 'TESTING'].includes(t.column?.title?.toUpperCase())).length,
    done: tasks.filter((t: any) => ['LISTO', 'DONE'].includes(t.column?.title?.toUpperCase())).length,
    blocked: tasks.filter((t: any) => t.isBlocked).length
  };

  return (
    <div className="min-h-screen bg-[#1d2125] text-[#c9d1d9] font-sans flex flex-col relative overflow-hidden">
      
      {/* Resplandores de Fondo */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-cyan-600/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* NAVBAR COMPARTIDO */}
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

      {/* CONTENIDO DEL PERFIL */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar">
        
        {/* Cambié max-w-2xl a max-w-4xl para que quepan bien los tickets */}
        <div className="w-full max-w-4xl mx-auto bg-[#161a1d] border border-[#30363d] rounded-3xl overflow-hidden shadow-2xl shadow-black/50 animate-in fade-in zoom-in-95 duration-500">
          
          {/* Banner superior (Cover) */}
          <div className="h-32 bg-gradient-to-r from-emerald-900/40 via-cyan-900/40 to-purple-900/40 relative border-b border-[#30363d]">
            {isOwnProfile && (
              <Link href="/profile" className="absolute top-4 right-4 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Edit3 size={16} /> Editar mi perfil
              </Link>
            )}
          </div>

          <div className="px-6 md:px-8 pb-10 relative">
            
            {/* Foto de Perfil  */}
            <div className="flex justify-between items-end -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-[#161a1d] bg-[#1d2125] flex items-center justify-center text-4xl font-bold text-emerald-400 shadow-xl overflow-hidden relative z-10">
                {targetUser.image ? (
                  <img src={targetUser.image} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  targetUser.name?.charAt(0).toUpperCase() || 'U'
                )}
              </div>
            </div>

            {/* Información del Usuario */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">{targetUser.name}</h1>
                <p className="text-emerald-400 font-medium mt-1">{isOwnProfile ? 'Tu Perfil' : 'Miembro de Tasky'}</p>
              </div>

              <div className="h-px w-full bg-[#30363d]"></div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 text-gray-300 bg-[#1d2125] p-4 rounded-xl border border-[#30363d]">
                  <div className="bg-[#161a1d] p-2 rounded-lg text-gray-500">
                    <Mail size={20} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Contacto</p>
                    <p className="font-medium truncate">{targetUser.email}</p>
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
              
              {/* --- NUEVA SECCIÓN: MÉTRICAS Y TICKETS --- */}
              <div className="mt-10 pt-6 border-t border-[#30363d]">
                <h2 className="text-xl font-bold text-white mb-4">Métricas de Trabajo</h2>
                
                {/* Tarjetas de Resumen */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                  <div className="bg-[#1d2125] p-4 rounded-xl border border-[#30363d]">
                    <div className="flex justify-between items-start mb-2"><ListTodo className="text-blue-400" size={20} /><span className="text-2xl font-bold text-white">{stats.todo}</span></div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Por Hacer</p>
                  </div>
                  <div className="bg-[#1d2125] p-4 rounded-xl border border-[#30363d]">
                    <div className="flex justify-between items-start mb-2"><Clock className="text-yellow-400" size={20} /><span className="text-2xl font-bold text-white">{stats.doing}</span></div>
                    <p className="text-xs text-gray-500 font-medium uppercase">En Curso</p>
                  </div>
                  <div className="bg-[#1d2125] p-4 rounded-xl border border-[#30363d]">
                    <div className="flex justify-between items-start mb-2"><CheckCircle className="text-emerald-400" size={20} /><span className="text-2xl font-bold text-white">{stats.done}</span></div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Completados</p>
                  </div>
                  <div className="bg-[#1d2125] p-4 rounded-xl border border-[#30363d]">
                    <div className="flex justify-between items-start mb-2"><AlertCircle className="text-red-400" size={20} /><span className="text-2xl font-bold text-white">{stats.blocked}</span></div>
                    <p className="text-xs text-gray-500 font-medium uppercase">Bloqueados</p>
                  </div>
                </div>

                {/* Lista de Actividades */}
                <div className="bg-[#1d2125] rounded-xl border border-[#30363d] overflow-hidden">
                  <div className="p-4 md:p-5 border-b border-[#30363d] flex justify-between items-center bg-[#161a1d]">
                    <h3 className="text-sm md:text-base font-bold text-white">Tickets Asignados Actualmente</h3>
                    <span className="text-xs md:text-sm text-gray-500 bg-[#22272b] px-2 py-1 rounded-md">{tasks.length} totales</span>
                  </div>
                  <div className="divide-y divide-[#30363d]">
                    {tasks.length === 0 ? (
                      <p className="p-10 text-center text-gray-500 text-sm">Este usuario no tiene tickets asignados en ningún proyecto.</p>
                    ) : (
                      tasks.map((task: any) => (
                        <div key={task.id} className="p-4 hover:bg-[#22272b] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                          <div className="flex flex-col gap-1.5 overflow-hidden">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] md:text-[10px] px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold uppercase tracking-wider">{task.taskyspace?.name || 'Proyecto'}</span>
                              {task.isBlocked && <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold uppercase">Bloqueado</span>}
                            </div>
                            <h4 className="text-sm md:text-base text-white font-medium group-hover:text-emerald-400 transition-colors truncate">{task.title}</h4>
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1"><Layout size={12}/> Columna: {task.column?.title || 'Sin columna'}</span>
                              {task.sprint && <span className="text-cyan-500/70">🏃‍♂️ Sprint: {task.sprint.name}</span>}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                             <span className="text-xs font-bold text-gray-400 bg-[#161a1d] px-2.5 py-1.5 rounded-lg border border-[#30363d] flex items-center gap-1"><Clock size={12}/> {task.effortHours || 0}h</span>
                             <div className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold uppercase ${
                               task.column?.title?.toUpperCase() === 'LISTO' || task.column?.title?.toUpperCase() === 'DONE' 
                               ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                               : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                             }`}>
                               {task.column?.title?.toUpperCase() === 'LISTO' || task.column?.title?.toUpperCase() === 'DONE' ? 'Terminado' : 'Pendiente'}
                             </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
              {/* --- FIN SECCIÓN MÉTRICAS --- */}

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}