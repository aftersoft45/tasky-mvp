// app/workspace/WorkspaceClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Target, Home, LayoutGrid, Plus, Rocket, FolderPlus, Bell, Search, Lock, Unlock, ArrowRight, Check, X, Settings, Menu } from 'lucide-react';
import UserProfileMenu from '../components/UserProfileMenu';
import CreateTaskyspaceWizard from './CreateTaskyspaceWizard';
import SpaceSettingsModal from './SpaceSettingsModal';

interface User { name?: string | null; email?: string | null; image?: string | null; }
interface WorkspaceClientProps { user: User; taskyspaces: any[]; }

export default function WorkspaceClient({ user, taskyspaces }: WorkspaceClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'para-ti' | 'espacios'>('para-ti');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [settingsModal, setSettingsModal] = useState<{isOpen: boolean, spaceId: string, spaceName: string}>({ isOpen: false, spaceId: '', spaceName: '' });
  
  // Estado para Menú Móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados para las Notificaciones
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [processingInvId, setProcessingInvId] = useState<string | null>(null);
  
  // Estados para el Modal de Contraseña
  const [passwordPrompt, setPasswordPrompt] = useState<{isOpen: boolean, invId: string | null, spaceName: string}>({ isOpen: false, invId: null, spaceName: '' });
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const res = await fetch('/api/invitations');
        if (res.ok) {
          const data = await res.json();
          setInvitations(data);
        }
      } catch (error) { console.error("Error cargando invitaciones", error); }
    };
    fetchInvitations();
  }, []);

  const handleInvitation = async (invId: string, action: 'accept' | 'reject', isPrivate: boolean, spaceName: string) => {
    if (action === 'accept' && isPrivate) {
      setPasswordPrompt({ isOpen: true, invId, spaceName });
      return;
    }
    await processAction(invId, action);
  };

  const processAction = async (invId: string, action: 'accept' | 'reject', password?: string) => {
    setProcessingInvId(invId);
    setPasswordError('');
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId: invId, action, password })
      });

      if (res.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== invId));
        if (action === 'accept') {
          setPasswordPrompt({ isOpen: false, invId: null, spaceName: '' });
          setPasswordInput('');
          router.refresh();
        }
      } else {
        const errText = await res.text();
        if (password) setPasswordError(errText);
        else alert(errText);
      }
    } catch (error) {
      alert("Error de red");
    } finally {
      setProcessingInvId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#1d2125] text-[#c9d1d9] font-sans overflow-hidden relative selection:bg-emerald-500/30 selection:text-emerald-200">
      
      {/* Resplandor de fondo global */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0 hidden md:block"></div>

      {isWizardOpen && <CreateTaskyspaceWizard onClose={() => setIsWizardOpen(false)} user={user} />}

      {settingsModal.isOpen && (
        <SpaceSettingsModal 
          spaceId={settingsModal.spaceId} 
          spaceName={settingsModal.spaceName} 
          onClose={() => setSettingsModal({isOpen: false, spaceId: '', spaceName: ''})} 
        />
      )}

      {/* MODAL DE CONTRASEÑA */}
      {passwordPrompt.isOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#161a1d] border border-[#30363d] p-6 rounded-2xl shadow-2xl w-full max-w-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>
            <h3 className="text-xl font-bold text-white mb-2">Se requiere contraseña</h3>
            <p className="text-sm text-gray-400 mb-4">El espacio <span className="text-emerald-400 font-bold">"{passwordPrompt.spaceName}"</span> es privado.</p>
            <input 
              type="password" 
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Contraseña del espacio"
              className="w-full bg-[#22272b] border border-[#30363d] rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none mb-2 transition-all"
            />
            {passwordError && <p className="text-xs text-red-500 mb-4">{passwordError}</p>}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setPasswordPrompt({ isOpen: false, invId: null, spaceName: '' })} className="flex-1 py-2.5 text-sm bg-[#2c333b] hover:bg-[#3d444d] text-white rounded-lg transition-colors">Cancelar</button>
              <button 
                onClick={() => processAction(passwordPrompt.invId!, 'accept', passwordInput)} 
                disabled={!passwordInput || processingInvId === passwordPrompt.invId}
                className="flex-1 py-2.5 text-sm bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                {processingInvId === passwordPrompt.invId ? 'Uniendo...' : 'Unirse'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVBAR GLOBAL SUPERIOR --- */}
      <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[#30363d] bg-[#161a1d]/80 backdrop-blur-md shrink-0 z-40 relative">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Botón menú móvil */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>

          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="bg-[#1d2125] p-1.5 rounded-lg border border-[#30363d] group-hover:border-emerald-500/50 transition-colors shadow-lg shadow-emerald-500/10 hidden sm:block">
              <Target className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-bold text-white text-lg tracking-wide">Tasky</span>
          </Link>

          <div className="relative w-48 lg:w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar proyectos..." 
              className="w-full bg-[#1d2125] border border-[#30363d] text-sm text-white rounded-md pl-10 pr-4 py-1.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3 md:gap-4 relative z-50">
          
          {/* CAMPANITA DE NOTIFICACIONES */}
          <div className="relative">
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)} 
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#2c333b] text-gray-400 transition-colors relative"
            >
              <Bell size={18} />
              {invitations.length > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#161a1d]"></span>
              )}
            </button>

            {/* DROPDOWN DE INVITACIONES */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-72 md:w-80 bg-[#1d2125] border border-[#30363d] rounded-xl shadow-2xl shadow-black py-2 z-50">
                <div className="px-4 py-2 border-b border-[#30363d]">
                  <h4 className="font-bold text-white">Notificaciones</h4>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {invitations.length === 0 ? (
                    <p className="text-center text-sm text-gray-500 py-6">No tienes notificaciones nuevas.</p>
                  ) : (
                    invitations.map(inv => (
                      <div key={inv.id} className="p-4 border-b border-[#30363d] hover:bg-[#22272b] transition-colors">
                        <p className="text-sm text-gray-300">
                          <span className="font-bold text-white">{inv.inviter.name}</span> te invitó a unirte a <span className="font-bold text-emerald-400">{inv.taskyspace.name}</span> como <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.5 rounded text-xs">{inv.role}</span>.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => handleInvitation(inv.id, 'accept', inv.taskyspace.privacy === 'Privado', inv.taskyspace.name)}
                            disabled={processingInvId === inv.id}
                            className="flex-1 flex justify-center items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 py-1.5 rounded font-bold text-xs disabled:opacity-50 transition-colors"
                          >
                            <Check size={14}/> Aceptar
                          </button>
                          <button 
                            onClick={() => processAction(inv.id, 'reject')}
                            disabled={processingInvId === inv.id}
                            className="flex-1 flex justify-center items-center gap-1 bg-[#2c333b] hover:bg-red-900/50 hover:text-red-400 hover:border-red-900 text-white border border-[#30363d] py-1.5 rounded font-medium text-xs disabled:opacity-50 transition-all"
                          >
                            <X size={14}/> Rechazar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MENU DE PERFIL */}
          <UserProfileMenu user={user} />
        </div>
      </header>

      {/* --- CONTENEDOR INFERIOR --- */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* OVERLAY MÓVIL PARA EL SIDEBAR */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* SIDEBAR RESPONSIVO */}
        <aside className={`
          fixed md:relative inset-y-0 left-0 z-40 
          w-64 bg-[#161a1d] border-r border-[#30363d] flex flex-col shrink-0 
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="p-4 md:hidden border-b border-[#30363d] flex justify-between items-center">
             <span className="font-bold text-white text-lg">Menú</span>
             <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
          </div>
          
          <nav className="flex-1 py-6 px-3 space-y-1">
            <button 
              onClick={() => { setActiveTab('para-ti'); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'para-ti' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-[#2c333b] hover:text-white'}`}
            >
              <Home size={18} /> Para ti
            </button>
            <button 
              onClick={() => { setActiveTab('espacios'); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'espacios' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-gray-400 hover:bg-[#2c333b] hover:text-white'}`}
            >
              <LayoutGrid size={18} /> Directorio
            </button>
          </nav>
          
          <div className="p-4 border-t border-[#30363d] relative z-20 space-y-3">
            <button onClick={() => { setIsWizardOpen(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-[#2c333b] hover:bg-[#3d444d] text-white py-2.5 rounded-lg text-sm font-medium transition-colors border border-[#30363d]">
              <Plus size={16} /> Nuevo Taskyspace
            </button>
          </div>
        </aside>

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="max-w-6xl mx-auto">
            
            <div className="flex items-center gap-3 mb-8">
              <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                {activeTab === 'para-ti' ? 'Para ti' : 'Directorio de proyectos'}
              </h1>
            </div>

            {/* VISTA: PARA TI */}
            {activeTab === 'para-ti' && (
              <section>
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-[#30363d] pb-2">Tus espacios recientes</h2>
                {taskyspaces.length > 0 ? (
                  // GRILLA RESPONSIVA: 1 col (móvil), 2 cols (tablet), 3 cols (desktop)
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
                    {taskyspaces.map((space) => (
                      <Link href={`/workspace/${space.id}`} key={space.id} className="bg-[#161a1d] border border-[#30363d] rounded-2xl p-5 md:p-6 hover:border-emerald-500/50 transition-all group hover:-translate-y-1 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] block relative">
                        <div className="flex justify-between items-start mb-4">
                           <div className="w-12 h-12 bg-[#1d2125] rounded-xl border border-[#30363d] flex items-center justify-center text-emerald-400 font-bold text-xl group-hover:bg-emerald-950 transition-colors shadow-inner">
                              {space.name.substring(0, 2).toUpperCase()}
                           </div>
                           
                           <div className="flex items-center gap-2 bg-[#1d2125] px-2 py-1 rounded-md border border-[#30363d]">
                             {space.privacy === 'Privado' ? <Lock size={14} className="text-emerald-500/70" /> : <Unlock size={14} className="text-gray-500" />}
                             
                             {/* Botón de Administración */}
                             {space.members[0]?.role === 'Administrador' && (
                               <button 
                                 onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSettingsModal({isOpen: true, spaceId: space.id, spaceName: space.name}); }}
                                 className="p-1 rounded hover:bg-[#2c333b] text-gray-400 hover:text-emerald-400 transition-colors ml-1"
                                 title="Administrar Espacio"
                               >
                                 <Settings size={16} />
                               </button>
                             )}
                           </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors line-clamp-1">{space.name}</h3>
                        
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            Rol: <span className="text-emerald-400 font-medium">{space.members[0]?.role}</span>
                          </span>
                          <ArrowRight className="text-gray-600 group-hover:text-emerald-400 transition-colors transform group-hover:translate-x-1" size={16} />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 flex flex-col items-center justify-center text-center p-8 md:p-12 border-2 border-dashed border-[#30363d] rounded-2xl bg-[#161a1d]/50 relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>
                    <div className="bg-[#1d2125] p-4 rounded-2xl border border-[#30363d] mb-6 shadow-xl relative z-10">
                      <Rocket className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Aún no hay nada por aquí</h3>
                    <p className="text-gray-400 max-w-md mb-8 relative z-10 text-sm md:text-base">Crea tu primer espacio para empezar a organizar tus proyectos de forma ágil.</p>
                    <button onClick={() => setIsWizardOpen(true)} className="relative z-10 flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-6 py-3 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                      <Plus size={20} /> Crear un Taskyspace
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* VISTA: ESPACIOS */}
            {activeTab === 'espacios' && (
              <section>
                <div className="flex justify-between items-center mb-4 border-b border-[#30363d] pb-2">
                  <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Lista completa</h2>
                </div>
                {taskyspaces.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    {taskyspaces.map((space) => (
                      <Link href={`/workspace/${space.id}`} key={space.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#161a1d] border border-[#30363d] rounded-xl p-4 hover:border-emerald-500/50 transition-colors group shadow-sm hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] gap-4 sm:gap-0">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#1d2125] rounded-lg border border-[#30363d] flex items-center justify-center text-emerald-400 font-bold group-hover:bg-emerald-950 transition-colors shrink-0">
                              {space.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h3 className="text-white font-bold group-hover:text-emerald-400 transition-colors text-base md:text-lg">{space.name}</h3>
                              <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                                Proyecto Kanban • Rol: <span className="text-emerald-400 bg-emerald-950/30 px-1.5 rounded">{space.members[0]?.role}</span>
                              </p>
                            </div>
                         </div>
                         
                         <div className="flex items-center justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-[#30363d] pt-3 sm:pt-0">
                           {space.privacy === 'Privado' && <Lock size={14} className="text-emerald-500/50" />}
                           {space.members[0]?.role === 'Administrador' && (
                             <button 
                               onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSettingsModal({isOpen: true, spaceId: space.id, spaceName: space.name}); }}
                               className="p-1.5 rounded-md bg-[#1d2125] border border-[#30363d] hover:bg-[#2c333b] text-gray-400 hover:text-emerald-400 transition-colors flex items-center gap-2 text-xs font-medium"
                             >
                               <Settings size={14} /> <span className="sm:hidden">Administrar</span>
                             </button>
                           )}
                           <ArrowRight className="hidden sm:block text-gray-600 group-hover:text-emerald-400 transition-colors transform group-hover:translate-x-1" size={20} />
                         </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="mt-8 flex flex-col items-center justify-center text-center p-10 bg-[#161a1d] rounded-xl border border-[#30363d]">
                    <FolderPlus className="w-12 h-12 text-gray-600 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-2">Aún no hay directorios</h3>
                    <button onClick={() => setIsWizardOpen(true)} className="mt-4 bg-[#2c333b] hover:bg-[#3d444d] text-white border border-[#30363d] px-5 py-2 rounded-lg font-medium transition-colors">
                      Crear Taskyspace
                    </button>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}