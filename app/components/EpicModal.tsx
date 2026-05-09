// app/components/EpicModal.tsx
// COMPONENTE MODAL de epicas
// el componente muestra un modal para visualizar y editar una epica
// incluye, nombre y descripcion, lista tareas, modo solo lectura y metricas de progreso
'use client';

import React, { useState } from 'react';
import { X, Layers, Save, CheckCircle, Clock, Target, ListTodo, AlignLeft } from 'lucide-react';

// componente principal
export default function EpicModal({ epic, tasks, columns, onClose, onSave, readOnly = false }: any) {
  
    //estado local
  const [formData, setFormData] = useState({
    name: epic.name || '',
    description: epic.description || '',
    color: epic.color || 'bg-purple-500',
  });
  //manejo de eventos
  const handleChange = (e: any) => {
    if (readOnly) return;
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (readOnly) return onClose();
    onSave(epic.id, formData);
    onClose();
  };

  // calculos de metricas
  const doneColumn = columns.find((c: any) => ['LISTO', 'DONE', 'COMPLETADO', 'FINALIZADO', 'HECHO'].includes(c.title.toUpperCase().trim()));
  const completedTasks = tasks.filter((t: any) => t.columnId === doneColumn?.id);
  
  const totalEffort = tasks.reduce((sum: number, t: any) => sum + (Number(t.effortHours) || 0), 0);
  const burnedEffort = completedTasks.reduce((sum: number, t: any) => sum + (Number(t.effortHours) || 0), 0);
  const progressPercentage = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  //renderizado
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#161a1d] border border-[#30363d] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="px-6 py-5 border-b border-[#30363d] flex justify-between items-start bg-[#1d2125] relative z-10">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 w-full group">
              <Layers className="text-purple-400 shrink-0 mt-1" size={28} />
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={readOnly}
                placeholder="Nombre de la Épica..."
                title="Haz clic para editar el nombre"
                className={`w-full bg-transparent text-2xl md:text-3xl font-extrabold text-white outline-none border-b-2 transition-all pb-1 ${readOnly ? 'border-transparent cursor-not-allowed' : 'border-transparent hover:border-purple-500/30 focus:border-purple-500 border-dashed group-hover:border-purple-500/30'}`}
              />
            </div>
            <p className="text-[10px] text-purple-400/70 uppercase tracking-widest font-bold mt-2 ml-11">Configuración y Detalles de Épica</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2c333b] rounded transition-colors shrink-0">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar relative z-10 flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-72 shrink-0 flex flex-col gap-6">
            
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlignLeft size={14} /> Descripción y Objetivos
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={readOnly}
                placeholder={readOnly ? "Esta épica no tiene descripción..." : "Escribe de qué trata esta épica, sus objetivos, alcance..."}
                className={`w-full h-32 custom-scrollbar resize-none rounded-xl p-3 text-sm transition-colors ${readOnly ? 'bg-[#1a1e23] border border-transparent text-gray-400 cursor-not-allowed' : 'bg-[#1d2125] border border-[#30363d] text-white hover:border-purple-500/50 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50'}`}
              />
            </div>
            <div className="bg-[#1d2125] border border-[#30363d] rounded-xl p-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Target size={14}/> Progreso Global</h4>
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-extrabold text-white">{progressPercentage}%</span>
              </div>
              <div className="w-full h-2 bg-[#22272b] rounded-full overflow-hidden border border-[#30363d]">
                <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1d2125] border border-[#30363d] rounded-xl p-3 flex flex-col justify-center items-center text-center">
                <ListTodo className="text-gray-400 mb-1" size={18}/>
                <span className="text-xl font-bold text-white">{tasks.length}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Tickets</span>
              </div>
              <div className="bg-[#1d2125] border border-[#30363d] rounded-xl p-3 flex flex-col justify-center items-center text-center">
                <CheckCircle className="text-emerald-400 mb-1" size={18}/>
                <span className="text-xl font-bold text-white">{completedTasks.length}</span>
                <span className="text-[10px] text-gray-500 uppercase font-bold">Listos</span>
              </div>
              <div className="bg-[#1d2125] border border-[#30363d] rounded-xl p-3 flex flex-col justify-center items-center text-center col-span-2">
                <Clock className="text-blue-400 mb-1" size={18}/>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white">{burnedEffort}h</span>
                  <span className="text-xs text-gray-500 font-medium">/ {totalEffort}h</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase font-bold mt-1">Esfuerzo Quemado</span>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col min-w-0 bg-[#1d2125] border border-[#30363d] rounded-xl p-4">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2 border-b border-[#30363d] pb-3">
              <ListTodo className="text-purple-400" size={18}/> Tareas de esta Épica
            </h4>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center p-8 border border-dashed border-[#30363d] rounded-xl">
                  <p className="text-gray-500 text-sm">No hay tareas ligadas a esta Épica todavía.</p>
                  <p className="text-gray-600 text-xs mt-1">Abre cualquier tarea y selecciona esta épica en el desplegable.</p>
                </div>
              ) : (
                tasks.map((task: any) => {
                  const col = columns.find((c: any) => c.id === task.columnId);
                  const isDone = col?.title.toUpperCase() === 'LISTO' || col?.title.toUpperCase() === 'DONE';

                  return (
                    <div key={task.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isDone ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-[#161a1d] border-[#30363d] hover:border-purple-500/30'}`}>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDone ? 'text-emerald-400 line-through opacity-70' : 'text-white'}`}>{task.title}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#22272b] text-gray-400 font-bold uppercase border border-[#30363d]">{task.type || 'Task'}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${isDone ? 'text-emerald-500' : 'text-gray-500'}`}>{col?.title || 'Backlog'}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1 bg-[#22272b] px-1.5 py-0.5 rounded border border-[#30363d]"><Clock size={10}/>{task.effortHours || 0}h</span>
                        {task.assignee ? (
                          <div className="w-5 h-5 rounded-full bg-[#22272b] border border-[#30363d] flex items-center justify-center text-[8px] font-bold text-white overflow-hidden" title={task.assignee.name}>
                            {task.assignee.image ? <img src={task.assignee.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar"/> : task.assignee.name.charAt(0)}
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#22272b] border border-dashed border-[#30363d] text-gray-600 flex items-center justify-center text-[8px]">?</div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#30363d] bg-[#1d2125] flex justify-end gap-3 relative z-10">
          {readOnly ? (
            <button onClick={onClose} className="bg-[#2c333b] hover:bg-[#3d444d] text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors">Cerrar</button>
          ) : (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"><Save size={16} /> Guardar Épica</button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}