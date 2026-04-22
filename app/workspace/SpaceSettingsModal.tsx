// app/workspace/SpaceSettingsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Shield, UserMinus, UserPlus, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  spaceId: string;
  spaceName: string;
  onClose: () => void;
}

export default function SpaceSettingsModal({ spaceId, spaceName, onClose }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'miembros' | 'ajustes'>('miembros');
  const [members, setMembers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [emailToInvite, setEmailToInvite] = useState('');
  const [roleToInvite, setRoleToInvite] = useState('Developer'); // 🔥 Rol por defecto actualizado
  const [loading, setLoading] = useState(true);

  // Cargar datos al abrir el modal
  const loadData = async () => {
    setLoading(true);
    const res = await fetch('/api/taskyspaces/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_data', spaceId })
    });
    if (res.ok) {
      const data = await res.json();
      setMembers(data.members);
      setPending(data.pendingInvs);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Funciones de administración
  const executeAction = async (payload: any, successMsg: string) => {
    const res = await fetch('/api/taskyspaces/manage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ spaceId, ...payload })
    });
    if (res.ok) {
      if (payload.action === 'delete_space') {
        onClose();
        router.refresh();
      } else {
        loadData(); // Recargamos la lista
      }
    } else {
      alert(await res.text());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-6">
      <div className="bg-[#1d2125] border border-[#30363d] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-black flex flex-col max-h-[90vh] relative">
        
        {/* Barra superior estilo neón */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500"></div>

        {/* HEADER */}
        <div className="flex justify-between items-start md:items-center p-5 md:p-6 border-b border-[#30363d] bg-[#161a1d] shrink-0">
          <div className="pr-4">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="text-emerald-400" size={24} /> 
              Administración
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Configurando: <span className="text-emerald-100 font-medium">{spaceName}</span>
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-white bg-[#1d2125] p-2 rounded-lg border border-[#30363d] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex px-2 sm:px-6 border-b border-[#30363d] bg-[#161a1d] shrink-0 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('miembros')} 
            className={`py-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'miembros' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            Miembros del Equipo
          </button>
          <button 
            onClick={() => setActiveTab('ajustes')} 
            className={`py-3 px-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ajustes' ? 'border-red-500 text-red-400' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            Zona de Peligro
          </button>
        </div>

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : activeTab === 'miembros' ? (
            <div className="space-y-8">
              
              {/* Sección: Invitar */}
              <div className="bg-[#161a1d] p-4 md:p-5 rounded-xl border border-[#30363d] shadow-inner">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Añadir al equipo</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input 
                    type="email" 
                    value={emailToInvite} 
                    onChange={e => setEmailToInvite(e.target.value)} 
                    placeholder="Email del usuario..." 
                    className="flex-1 bg-[#22272b] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" 
                  />
                  <select 
                    value={roleToInvite} 
                    onChange={e => setRoleToInvite(e.target.value)} 
                    className="w-full sm:w-auto bg-[#22272b] border border-[#30363d] rounded-lg px-3 py-2.5 text-sm text-white font-medium focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all cursor-pointer"
                  >
                    {/* 🔥 NUEVOS ROLES ÁGILES 🔥 */}
                    <option value="Developer">Developer</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Product Owner">Product Owner</option>
                    <option value="Tech Lead">Tech Lead</option>
                    <option value="Tester">Tester</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                  <button 
                    onClick={() => { executeAction({ action: 'invite_user', emailToInvite, roleToInvite }, 'Invitado'); setEmailToInvite(''); }} 
                    disabled={!emailToInvite.includes('@')}
                    className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:shadow-none"
                  >
                    <UserPlus size={18}/> Invitar
                  </button>
                </div>
              </div>

              {/* Lista Miembros */}
              <div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Miembros Activos ({members.length})</h3>
                <div className="space-y-3">
                  {members.map(m => (
                    <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#22272b] p-3 md:p-4 rounded-xl border border-[#30363d] gap-4 sm:gap-0">
                      
                      {/* Info del usuario */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0 overflow-hidden">
                          {m.user.image ? <img src={m.user.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar" /> : m.user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-sm text-white font-medium truncate">{m.user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{m.user.email}</p>
                        </div>
                      </div>

                      {/* Controles de Admin */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t border-[#30363d] sm:border-0">
                        <select 
                          value={m.role} 
                          onChange={(e) => executeAction({ action: 'change_role', targetUserId: m.user.id, newRole: e.target.value }, 'Rol actualizado')}
                          className="bg-[#161a1d] border border-[#30363d] rounded-lg text-xs md:text-sm text-gray-300 py-1.5 px-2 outline-none focus:border-emerald-500 transition-colors cursor-pointer font-medium"
                        >
                          {/* 🔥 NUEVOS ROLES ÁGILES 🔥 */}
                          <option value="Developer">Developer</option>
                          <option value="Project Manager">Project Manager</option>
                          <option value="Product Owner">Product Owner</option>
                          <option value="Tech Lead">Tech Lead</option>
                          <option value="Tester">Tester</option>
                          <option value="DevOps">DevOps</option>
                          <option value="Administrador">Administrador</option>
                        </select>
                        <button 
                          onClick={() => { if(confirm(`¿Estás seguro de expulsar a ${m.user.name}?`)) executeAction({ action: 'remove_member', targetUserId: m.user.id }, 'Expulsado'); }} 
                          className="text-gray-500 hover:text-red-400 bg-[#161a1d] border border-[#30363d] hover:border-red-900 p-1.5 rounded-lg transition-colors flex items-center justify-center"
                          title="Expulsar usuario"
                        >
                          <UserMinus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invitaciones Pendientes */}
              {pending.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Invitaciones Pendientes ({pending.length})</h3>
                  <div className="space-y-2">
                    {pending.map(p => (
                      <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#161a1d] p-3 rounded-xl border border-[#30363d] opacity-80 gap-2 sm:gap-0">
                        <p className="text-sm text-gray-300 truncate">
                          {p.invitedUser.email} 
                          <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded text-xs ml-2 font-medium uppercase tracking-wider">
                            {p.role}
                          </span>
                        </p>
                        <span className="text-xs font-medium text-yellow-500 border border-yellow-900/50 bg-yellow-900/20 px-2 py-1 rounded w-fit">
                          Esperando respuesta...
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // ZONA DE PELIGRO
            <div className="bg-red-950/10 border border-red-900/50 rounded-2xl p-6 text-center mt-4">
              <div className="w-16 h-16 bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-900/50">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Eliminar Taskyspace</h3>
              <p className="text-sm text-gray-400 mb-8 max-w-md mx-auto">
                Esta acción es <span className="text-red-300 font-bold">irreversible</span>. Se eliminarán todas las tareas, columnas, configuraciones y se expulsará permanentemente a todos los miembros de este espacio.
              </p>
              <button 
                onClick={() => { if(prompt(`Escribe "${spaceName}" para confirmar la eliminación de todo el proyecto:`) === spaceName) executeAction({ action: 'delete_space' }, 'Eliminado'); }} 
                className="w-full sm:w-auto bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all hover:-translate-y-0.5"
              >
                Sí, eliminar permanentemente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}