// app/workspace/CreateTaskyspaceWizard.tsx
'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Target, X, Code, KanbanSquare, ArrowRight, Lock, Unlock, Zap, Plus, GripVertical, Trash2, Edit2, Check, Rocket, ListTodo, GitCommit, Layers, BarChart2, Users } from 'lucide-react';

interface CreateTaskyspaceWizardProps {
  onClose: () => void;
  user: { name?: string | null };
}

const defaultStatuses = [
  { id: 1, name: 'Por Hacer', color: 'bg-gray-600' },
  { id: 2, name: 'En Curso', color: 'bg-cyan-600' },
  { id: 3, name: 'En Revisión', color: 'bg-yellow-600' },
  { id: 4, name: 'Listo', color: 'bg-green-600' },
];

const defaultActivities = [
  { id: 1, name: 'Configurar repositorio y base de datos' },
  { id: 2, name: 'Diseñar la pantalla de autenticación' },
  { id: 3, name: 'Definir arquitectura de la API' },
];

// 🔥 Función helper para darle colores únicos a cada rol en la UI
const getRoleBadgeStyle = (roleName: string) => {
  switch(roleName) {
    case 'Administrador': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'Product Owner': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Project Manager': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Tech Lead': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'Tester': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    case 'DevOps': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; // Developer
  }
};

export default function CreateTaskyspaceWizard({ onClose, user }: CreateTaskyspaceWizardProps) {
  const router = useRouter(); 
  const [isLoading, setIsLoading] = useState(false); 
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    template: 'Desarrollo de Software', 
    projectType: 'Scrum', 
    name: '',
    privacy: 'Abierto' as 'Abierto' | 'Privado',
    password: '',
    activities: defaultActivities,
    statuses: defaultStatuses,
    invitations: [] as { email: string; role: string; name?: string }[]
  });

  const [newActivityName, setNewActivityName] = useState('');
  
  const [newStatusName, setNewStatusName] = useState('');
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [editingStatusName, setEditingStatusName] = useState('');

  // 🔥 SOLUCIÓN: Cambiamos el rol por defecto de 'Miembro' a 'Developer'
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer'); 
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const steps = [
    { title: 'Plantilla Ágil', desc: 'Selecciona el framework para tu equipo.' },
    { title: 'Resumen de Módulos', desc: 'Todo el poder de tu nuevo espacio de trabajo.' },
    { title: 'Detalles del Proyecto', desc: 'Démosle nombre y seguridad a tu ecosistema.' },
    { title: 'Backlog Inicial', desc: 'Añade las primeras tareas o ideas pendientes.' },
    { title: 'Flujo de Estados', desc: 'Configura las columnas de tu Tablero Kanban.' },
    { title: 'Invita a tu equipo', desc: 'Asigna roles Ágiles al equipo.' },
    { title: '¡Lanzamiento!', desc: 'Tu Taskyspace está listo para despegar.' },
  ];

  const canGoNext = () => {
    if (currentStep === 3) {
      if (!formData.name.trim()) return false; 
      if (formData.privacy === 'Privado' && !formData.password.trim()) return false; 
    }
    return true;
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 7));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFinish = async () => {
    setIsLoading(true); 
    try {
      const payload = {
        name: formData.name,
        privacy: formData.privacy,
        password: formData.privacy === 'Privado' ? formData.password : null,
        includeTasks: true,
        customTasks: formData.activities.map(a => a.name),
        customStatuses: formData.statuses.map(s => ({ name: s.name, color: s.color })),
        invitations: formData.invitations 
      };

      const response = await fetch('/api/taskyspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onClose(); 
        router.refresh(); 
      } else {
        const errorText = await response.text(); 
        alert(`Ocurrió un error al crear el espacio: ${errorText}`); 
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión. Revisa tu internet o la consola."); 
    } finally {
      setIsLoading(false); 
    }
  };

  const Step1Templates = () => (
    <div className="space-y-4 pt-4">
      <div className="bg-[#22272b] p-6 rounded-xl border-2 border-emerald-500 flex gap-5 items-start cursor-default shadow-[0_0_20px_rgba(16,185,129,0.15)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none"></div>
        <div className="absolute top-4 right-4 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-widest shadow-sm">
          Activa por defecto
        </div>
        <div className="bg-[#161a1d] p-4 rounded-xl border border-emerald-500/30 text-emerald-400 relative z-10 shadow-inner">
          <Code className="w-10 h-10" />
        </div>
        <div className="relative z-10">
          <h4 className="text-2xl font-extrabold text-white tracking-tight mb-2">Desarrollo Ágil (Scrum)</h4>
          <p className="text-sm text-gray-400 leading-relaxed pr-8">
            El framework definitivo para equipos de desarrollo. Optimizado para la entrega continua de valor, iteraciones rápidas y control total sobre el ciclo de vida del software.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="bg-[#161a1d] border border-[#30363d] text-gray-300 text-xs px-2.5 py-1 rounded font-medium">Sprints</span>
            <span className="bg-[#161a1d] border border-[#30363d] text-gray-300 text-xs px-2.5 py-1 rounded font-medium">Story Points</span>
            <span className="bg-[#161a1d] border border-[#30363d] text-gray-300 text-xs px-2.5 py-1 rounded font-medium">Priorización</span>
          </div>
        </div>
      </div>
    </div>
  );

  const Step2KanbanSummary = () => (
    <div className="space-y-6 pt-4">
      <div className="bg-[#22272b] p-5 rounded-xl border border-[#30363d] flex gap-4 items-center">
        <div className="bg-[#1d2125] p-3 rounded-lg border border-[#30363d] text-emerald-400">
          <ListTodo className="w-7 h-7" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-white">Ecosistema Completo</h4>
          <p className="mt-0.5 text-sm text-gray-400">Tu espacio incluye todo lo necesario para gestionar proyectos complejos de inicio a fin.</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#161a1d] p-4 rounded-xl border border-[#30363d] hover:border-emerald-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-md"><KanbanSquare size={16}/></div>
              <span className="text-sm font-bold text-white">Backlog y Tablero Kanban</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Planifica iteraciones arrastrando tickets a Sprints y visualiza el progreso en vivo en columnas personalizables.</p>
          </div>
          
          <div className="bg-[#161a1d] p-4 rounded-xl border border-[#30363d] hover:border-purple-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-500/10 text-purple-400 rounded-md"><Layers size={16}/></div>
              <span className="text-sm font-bold text-white">Mapa de Épicas</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Agrupa tareas bajo grandes objetivos. Visualiza el esfuerzo quemado y el progreso global con indicadores en tiempo real.</p>
          </div>

          <div className="bg-[#161a1d] p-4 rounded-xl border border-[#30363d] hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-md"><GitCommit size={16}/></div>
              <span className="text-sm font-bold text-white">Sistema de Sub-tareas</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Divide tickets complejos. Las tareas principales no se pueden cerrar si sus sub-tareas siguen pendientes en el flujo.</p>
          </div>

          <div className="bg-[#161a1d] p-4 rounded-xl border border-[#30363d] hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-cyan-500/10 text-cyan-400 rounded-md"><BarChart2 size={16}/></div>
              <span className="text-sm font-bold text-white">Métricas y Resumen</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">Dashboard con velocidad de sprint, distribución de carga por miembro y alerta de tickets bloqueados o urgentes.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const Step3Details = () => (
    <div className="space-y-6 pt-4">
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1.5">Nombre del Proyecto <span className="text-red-400">*</span></label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          autoFocus
          placeholder="Ej. Nube Digital v2.0, Portal de Ventas..." 
          className="w-full bg-[#22272b] border border-[#30363d] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
        />
        {!formData.name && <p className="text-[10px] text-red-400 mt-1.5 font-medium uppercase tracking-wider">Requerido para avanzar</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <button 
          onClick={() => setFormData(prev => ({ ...prev, privacy: 'Abierto', password: '' }))}
          className={`p-5 rounded-xl border-2 flex flex-col gap-2 items-center text-center transition-all ${
            formData.privacy === 'Abierto' ? 'bg-[#22272b] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-[#161a1d] border-[#30363d] hover:border-[#424c58]'
          }`}
        >
          <Unlock className={`w-8 h-8 ${formData.privacy === 'Abierto' ? 'text-emerald-400' : 'text-gray-500'}`} />
          <h5 className="font-semibold text-white">Espacio Público</h5>
          <p className="text-xs text-gray-400 leading-tight">Cualquiera con el enlace directo o invitación puede acceder y visualizar el progreso.</p>
        </button>
        
        <button 
          onClick={() => setFormData(prev => ({ ...prev, privacy: 'Privado' }))}
          className={`p-5 rounded-xl border-2 flex flex-col gap-2 items-center text-center transition-all ${
            formData.privacy === 'Privado' ? 'bg-[#22272b] border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-[#161a1d] border-[#30363d] hover:border-[#424c58]'
          }`}
        >
          <Lock className={`w-8 h-8 ${formData.privacy === 'Privado' ? 'text-emerald-400' : 'text-gray-500'}`} />
          <h5 className="font-semibold text-white">Espacio Privado</h5>
          <p className="text-xs text-gray-400 leading-tight">Acceso estrictamente restringido. Ideal para datos sensibles, clientes o código NDA.</p>
        </button>
      </div>

      {formData.privacy === 'Privado' && (
        <div className="animate-in fade-in zoom-in-95 duration-200 bg-[#161a1d] p-4 rounded-xl border border-emerald-500/30">
          <label className="block text-xs font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Lock size={14}/> Contraseña de bóveda <span className="text-red-400">*</span></label>
          <input 
            type="password" 
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="Establece una clave maestra segura..." 
            className="w-full bg-[#22272b] border border-emerald-500/50 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)]"
          />
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">Incluso los usuarios que invites directamente al espacio necesitarán introducir esta clave la primera vez que ingresen.</p>
        </div>
      )}
    </div>
  );

  const Step4Activities = () => {
    const addActivity = () => {
      if (newActivityName.trim()) {
        const newId = Date.now();
        setFormData(prev => ({ ...prev, activities: [...prev.activities, { id: newId, name: newActivityName.trim() }] }));
        setNewActivityName('');
      }
    };

    const removeActivity = (id: number) => {
      setFormData(prev => ({ ...prev, activities: prev.activities.filter(act => act.id !== id) }));
    };

    return (
      <div className="space-y-6 pt-4">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={newActivityName}
            onChange={(e) => setNewActivityName(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') addActivity(); }}
            placeholder="Ej. Crear repositorio en GitHub y enlazar Vercel" 
            className="flex-1 bg-[#161a1d] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
          />
          <button onClick={addActivity} className="flex items-center gap-1.5 bg-[#2c333b] hover:bg-[#3d444d] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-[#30363d]">
            <Plus size={16} /> Añadir
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {formData.activities.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-3 bg-[#22272b] rounded-lg border border-[#30363d] group hover:border-emerald-500/30 transition-colors">
              <span className="text-sm text-white flex items-center gap-3"><Target size={16} className="text-emerald-400"/> {activity.name}</span>
              <button onClick={() => removeActivity(activity.id)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all p-1 bg-[#161a1d] rounded">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {formData.activities.length === 0 && <p className="text-center text-sm text-gray-500 pt-10">Tu Backlog empezará completamente vacío. Podrás añadir ideas después.</p>}
        </div>
      </div>
    );
  };

  const Step5Statuses = () => {
    const addStatus = () => {
      if (newStatusName.trim()) {
        const newId = Date.now();
        setFormData(prev => ({ ...prev, statuses: [...prev.statuses, { id: newId, name: newStatusName.trim(), color: 'bg-gray-600' }] }));
        setNewStatusName('');
      }
    };

    const removeStatus = (id: number) => setFormData(prev => ({ ...prev, statuses: prev.statuses.filter(s => s.id !== id) }));
    const startEditing = (id: number, name: string) => { setEditingStatusId(id); setEditingStatusName(name); };
    
    const saveEditing = (id: number) => {
      if (editingStatusName.trim()) setFormData(prev => ({ ...prev, statuses: prev.statuses.map(s => s.id === id ? { ...s, name: editingStatusName.trim() } : s) }));
      setEditingStatusId(null);
    };

    const moveStatus = (index: number, direction: 'up' | 'down') => {
      const newStatuses = [...formData.statuses];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newStatuses.length) return;
      [newStatuses[index], newStatuses[targetIndex]] = [newStatuses[targetIndex], newStatuses[index]];
      setFormData(prev => ({ ...prev, statuses: newStatuses }));
    };

    return (
      <div className="space-y-6 pt-4">
        <div className="flex gap-3">
          <input 
            type="text" 
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') addStatus(); }}
            placeholder="Añade una nueva columna (Ej. Pruebas (QA), Validado)" 
            className="flex-1 bg-[#161a1d] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
          />
          <button onClick={addStatus} className="flex items-center gap-1.5 bg-[#2c333b] hover:bg-[#3d444d] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors border border-[#30363d]">
            <Plus size={16} /> Columna
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
          {formData.statuses.map((status, index) => (
            <div key={status.id} className="flex items-center gap-3 p-3 bg-[#22272b] rounded-lg border border-[#30363d] group hover:border-emerald-500/30 transition-colors">
              <div className={`w-1.5 h-6 rounded-full ${status.color}`}></div>
              
              {editingStatusId === status.id ? (
                <input type="text" value={editingStatusName} onChange={(e) => setEditingStatusName(e.target.value)} className="flex-1 bg-[#1d2125] border border-emerald-500 rounded px-3 py-1 text-sm text-white focus:outline-none shadow-inner" onBlur={() => saveEditing(status.id)} autoFocus onKeyDown={(e) => { if (e.key === 'Enter') saveEditing(status.id); }}/>
              ) : (
                <span className="flex-1 text-sm text-white font-bold tracking-wide">{status.name}</span>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all text-gray-500">
                {editingStatusId === status.id ? (
                  <button onClick={() => saveEditing(status.id)} className="hover:text-emerald-400 p-1.5 bg-[#161a1d] rounded"><Check size={16}/></button>
                ) : (
                  <button onClick={() => startEditing(status.id, status.name)} className="hover:text-blue-400 p-1.5 bg-[#161a1d] rounded"><Edit2 size={16}/></button>
                )}
                <button onClick={() => removeStatus(status.id)} className="hover:text-red-400 p-1.5 bg-[#161a1d] rounded"><Trash2 size={16}/></button>
                <div className="flex flex-col gap-0.5 ml-2">
                  <button onClick={() => moveStatus(index, 'up')} disabled={index === 0} className="hover:text-white disabled:opacity-30 disabled:hover:text-gray-500">▲</button>
                  <button onClick={() => moveStatus(index, 'down')} disabled={index === formData.statuses.length - 1} className="hover:text-white disabled:opacity-30 disabled:hover:text-gray-500">▼</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const Step6Team = () => {
    const addInvitation = async () => {
      setSearchError('');
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !trimmedEmail.includes('@')) { setSearchError('Introduce un correo válido.'); return; }
      if (formData.invitations.some(inv => inv.email === trimmedEmail)) { setSearchError('Este usuario ya está en la lista de invitados.'); return; }

      setIsSearching(true);
      try {
        const res = await fetch(`/api/users/search?email=${encodeURIComponent(trimmedEmail)}`);
        const data = await res.json();
        if (data.isSelf) { setSearchError('No puedes invitarte a ti mismo (ya eres el dueño).'); } 
        else if (data.found) { setFormData(prev => ({ ...prev, invitations: [...prev.invitations, { email: data.user.email, role, name: data.user.name }] })); setEmail(''); } 
        else { setSearchError('Usuario no encontrado. Asegúrate de que ya tenga cuenta en Tasky.'); }
      } catch (error) { setSearchError('Hubo un problema al buscar al usuario. Intenta de nuevo.'); } 
      finally { setIsSearching(false); }
    };

    const removeInvitation = (emailToRemove: string) => setFormData(prev => ({ ...prev, invitations: prev.invitations.filter(inv => inv.email !== emailToRemove) }));

    return (
      <div className="space-y-6 pt-4">
        <div className="space-y-3 bg-[#1a1e23] p-5 rounded-xl border border-[#30363d]">
          <label className="block text-sm font-bold text-gray-300">Buscar por correo electrónico <span className="text-emerald-400">*</span></label>
          <div className="flex gap-3">
            <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setSearchError(''); }} onKeyDown={(e) => { if(e.key === 'Enter') addInvitation(); }} placeholder="Ej. dev@empresa.com" className="flex-1 bg-[#161a1d] border border-[#30363d] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-all shadow-inner"/>
            
            {/* 🔥 NUEVO MENÚ DE ROLES ÁGILES 🔥 */}
            <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-[#161a1d] border border-[#30363d] font-bold text-sm text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition-all outline-none">
              <option value="Developer">Developer</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Product Owner">Product Owner</option>
              <option value="Tech Lead">Tech Lead</option>
              <option value="Tester">Tester</option>
              <option value="DevOps">DevOps</option>
              <option value="Administrador">Administrador</option>
            </select>

            <button onClick={addInvitation} disabled={isSearching} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-md">
              {isSearching ? 'Buscando...' : <><Plus size={16} /> Agregar</>}
            </button>
          </div>
          {searchError && <p className="text-xs text-red-400 font-medium bg-red-950/20 px-3 py-1.5 rounded inline-block border border-red-900/30">{searchError}</p>}
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
          {formData.invitations.map((inv: any) => (
            <div key={inv.email} className="flex items-center gap-4 p-4 bg-[#22272b] rounded-xl border border-[#30363d] border-l-4 border-l-emerald-500 shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[#161a1d] border-2 border-[#30363d] flex items-center justify-center text-emerald-400 font-bold text-lg">{(inv.name || inv.email).charAt(0).toUpperCase()}</div>
              <div className="flex-1">
                <span className="text-sm text-white font-bold block">{inv.name || 'Usuario Tasky'}</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{inv.email}</span>
                  {/* 🔥 APLICACIÓN DE COLORES DINÁMICOS POR ROL 🔥 */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeStyle(inv.role)}`}>
                    {inv.role}
                  </span>
                </div>
              </div>
              <button onClick={() => removeInvitation(inv.email)} className="text-gray-500 hover:text-red-400 bg-[#161a1d] p-2 rounded-lg transition-colors border border-[#30363d]"><Trash2 size={18} /></button>
            </div>
          ))}
          {formData.invitations.length === 0 && (
             <div className="text-center p-8 border border-dashed border-[#30363d] rounded-xl">
                <Users size={32} className="mx-auto text-gray-600 mb-3" />
                <p className="text-sm text-gray-400 font-medium">Aún no has agregado a nadie a tu equipo.</p>
                <p className="text-xs text-gray-500 mt-1">Serás el único administrador y miembro de este espacio por ahora.</p>
             </div>
          )}
        </div>
      </div>
    );
  };

  const Step7Final = () => (
    <div className="space-y-6 pt-4 text-center flex flex-col items-center">
      <div className="bg-[#2c333b] p-6 rounded-full border-2 border-dashed border-emerald-500/50 mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)] relative overflow-hidden group">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/20 blur-[40px] rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-700"></div>
         <Rocket className="w-16 h-16 text-emerald-400 relative z-10 animate-pulse" />
      </div>
      <h3 className="text-3xl font-extrabold text-white leading-tight">
        El ecosistema <span className="text-emerald-400 border-b-2 border-emerald-500/30 pb-1">"{formData.name || 'Sin nombre'}"</span> está listo.
      </h3>
      <p className="mt-4 text-sm text-gray-400 max-w-lg leading-relaxed">
        Se generará un entorno Ágil con <span className="text-white font-bold">{formData.statuses.length} columnas de flujo</span>, un Backlog preparado con <span className="text-white font-bold">{formData.activities.length} tickets iniciales</span>, y un nivel de acceso configurado como <span className="text-white font-bold uppercase">{formData.privacy}</span>.
      </p>
      
      {formData.invitations.length > 0 && (
        <p className="text-xs font-bold text-emerald-500/80 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
          Se enviarán {formData.invitations.length} notificaciones de invitación.
        </p>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: return Step1Templates(); 
      case 2: return Step2KanbanSummary();
      case 3: return Step3Details();
      case 4: return Step4Activities();
      case 5: return Step5Statuses();
      case 6: return Step6Team();
      case 7: return Step7Final();
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000]/70 flex items-center justify-center z-[100] p-4 transition-all duration-300 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-[#1d2125] border border-[#30363d] rounded-2xl p-8 shadow-2xl relative flex flex-col h-[700px] transition-all">
        
        <div className="flex justify-between items-start mb-8 border-b border-[#30363d] pb-6">
          <div className="flex-1 pr-6">
            <p className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 w-max rounded font-bold uppercase tracking-widest mb-3">Paso {currentStep} de 7</p>
            <h2 className="text-3xl font-extrabold text-white">{steps[currentStep-1].title}</h2>
            <p className="text-sm text-gray-400 mt-2">{steps[currentStep-1].desc}</p>
          </div>
          <button onClick={onClose} disabled={isLoading} className="text-gray-500 hover:text-white bg-[#161a1d] border border-[#30363d] p-2 rounded-lg transition-colors disabled:opacity-50"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar">
          {renderStepContent()}
        </div>

        <div className="flex justify-between items-center mt-8 border-t border-[#30363d] pt-6 relative z-10">
          <button onClick={prevStep} disabled={currentStep === 1 || isLoading} className="text-sm text-gray-400 hover:text-white font-bold transition-colors disabled:opacity-30 disabled:hover:text-gray-500 bg-[#161a1d] px-5 py-2.5 rounded-lg border border-[#30363d]">
            ← Atrás
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} disabled={isLoading} className="text-sm bg-[#2c333b] hover:bg-[#3d444d] text-white px-5 py-2.5 rounded-lg font-bold transition-colors border border-[#30363d] disabled:opacity-50">
              Cancelar
            </button>
            {currentStep < 7 ? (
              <button 
                onClick={nextStep} 
                disabled={!canGoNext()} 
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-emerald-700 disabled:border-emerald-800 text-neutral-950 px-8 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:shadow-none"
              >
                Siguiente →
              </button>
            ) : (
              <button onClick={handleFinish} disabled={isLoading || !canGoNext()} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-8 py-2.5 rounded-lg font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-70 disabled:cursor-not-allowed group">
                 <Rocket size={18} className={`group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform ${isLoading ? "animate-pulse" : ""}`} /> 
                 {isLoading ? 'Construyendo...' : 'Crear Taskyspace'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
      `}} />
    </div>
  );
}