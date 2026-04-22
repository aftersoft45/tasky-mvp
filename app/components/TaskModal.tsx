// app/components/TaskModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Clock, Calendar, AlertCircle, CheckSquare, Save, RefreshCcw, Lock, CheckCircle, GitCommit, Plus, Trash2 } from 'lucide-react';

export default function TaskModal({ 
    task,
    allTasks = [],
    columns = [],
    onClose,
    onSave,
    onAddSubtask,
    onToggleSubtask,
    onDeleteSubtask, 
    onAssignSubtask, 
    members, 
    epics = [], 
    readOnly = false, 
    currentUserRole = 'Developer', 
    currentUserId }: any) {
    
    /* Estado del formulario con todos los campos editables de la tarea */
    const [formData, setFormData] = useState({
        title: task.title || '',
        type: task.parentId ? 'Sub' : (task.type || 'Task'),
        priority: task.priority || 'Media',
        effortHours: task.effortHours || 0,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assigneeId: task.assigneeId || '',
        epicId: task.epicId || '',
        description: task.description || '',
        acceptanceCriteria: task.acceptanceCriteria || '',
        notes: task.notes || '',
        isBlocked: task.isBlocked || false,
    });

    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

    const subtasks = allTasks.filter((t: any) => t.parentId === task.id);

    const effortOptions = [0, 2, 4, 6, 8, 10, 16, 24, 40];

    /* permisos basados en roles */
    const isAdmin = currentUserRole === 'Administrador';

    const canEditCriteria = isAdmin || currentUserRole === 'Product Owner';
    
    const canEditPlanning = isAdmin || currentUserRole === 'Project Manager';
    
    const canBlock = isAdmin || currentUserRole === 'Tester';
    
    const canAddSubtasks = isAdmin || currentUserRole === 'Tech Lead' || currentUserRole === 'Developer' ;

    const canAssignSubtasks = currentUserRole !== 'Solo Visor';

    /* calcular dias restantes para la fecha objetivo*/
    const calculateRemainingDays = () => {
        if (!formData.dueDate) return null;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const target = new Date(formData.dueDate); target.setMinutes(target.getMinutes() + target.getTimezoneOffset());
        return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    };

    const remainingDays = calculateRemainingDays();
    const lastUpdated = task.updatedAt ? new Date(task.updatedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No registrada';

    const handleChange = (e: any) => {
        if (readOnly) return;
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = () => {
        if (readOnly) return onClose();
        onSave(task.id, formData);
        onClose();
    };

    const handleCreateSubtask = () => {
        if (!newSubtaskTitle.trim() || readOnly) return;
        if (onAddSubtask) {
            onAddSubtask(task.id, newSubtaskTitle);
            setNewSubtaskTitle('');
        }
    };

/* ESTILOS Reutilizables */

    const inputClass = readOnly
        ? "w-full bg-[#1a1e23] border border-transparent text-sm text-gray-400 rounded-lg px-3 py-2 cursor-not-allowed"
        : "w-full bg-[#22272b] border border-[#30363d] text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500";

   return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-[#161a1d] border border-[#30363d] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-[#30363d] flex justify-between items-start bg-[#1d2125] rounded-t-2xl">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3">
              {task.parentId && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded flex items-center gap-1 font-bold shrink-0"><GitCommit size={12}/> SUB-TAREA</span>}
              <input type="text" name="title" value={formData.title} onChange={handleChange} disabled={readOnly} className={`w-full bg-transparent text-xl font-bold text-white outline-none border-b transition-colors pb-1 ${readOnly ? 'border-transparent cursor-not-allowed' : 'border-transparent hover:border-[#30363d] focus:border-emerald-500'}`}/>
              {readOnly && <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded flex items-center gap-1 font-bold shrink-0"><Lock size={12}/> Solo lectura</span>}
            </div>
            <div className="flex gap-4 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1"><RefreshCcw size={12}/> Última act: {lastUpdated}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2c333b] rounded transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-5 md:col-span-1">
              
              <div>
                <label className="block text-xs font-bold text-purple-400 uppercase mb-1.5 flex items-center gap-1.5">
                  🚀 Épica {!canEditCriteria && !readOnly && <Lock size={10} className="text-gray-500" title="Solo PO" />}
                </label>
                <select name="epicId" value={formData.epicId} onChange={handleChange} disabled={readOnly || !!task.parentId || !canEditCriteria} className={`${inputClass} ${!canEditCriteria ? 'opacity-70 cursor-not-allowed' : 'border-purple-500/30 focus:border-purple-500 bg-purple-500/5'}`}>
                  <option value="">Sin Épica</option>
                  {epics?.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
                {task.parentId && <p className="text-[10px] text-gray-500 mt-1">Las sub-tareas heredan la épica.</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Tipo de Ticket</label>
                <select name="type" value={formData.type} onChange={handleChange} disabled={readOnly || !!task.parentId} className={inputClass}>
                  <option value="Task">Task</option><option value="Feature">Feature</option><option value="Bug">Bug</option><option value="Doc">Doc</option><option value="Artefacto">Artefacto</option><option value="Spike">Spike</option><option value="Sub">Sub</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Prioridad</label>
                <select name="priority" value={formData.priority} onChange={handleChange} disabled={readOnly || (!canEditPlanning && !canEditCriteria)} className={inputClass}><option value="Alta">🔴 Alta (P0/P1)</option><option value="Media">🟡 Media (P2)</option><option value="Baja">🔵 Baja (P3)</option></select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <Clock size={14}/> Esfuerzo (Hrs) {!canEditPlanning && !readOnly && <Lock size={10} className="text-gray-500" title="Solo PM" />}
                </label>
                <select name="effortHours" value={formData.effortHours} onChange={handleChange} disabled={readOnly || !canEditPlanning} className={`${inputClass} ${!canEditPlanning ? 'opacity-70 cursor-not-allowed' : ''}`}>{effortOptions.map(hrs => <option key={hrs} value={hrs}>{hrs} horas</option>)}</select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14}/> Fecha Objetivo {!canEditPlanning && !readOnly && <Lock size={10} className="text-gray-500" title="Solo PM" />}
                </label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} disabled={readOnly || !canEditPlanning} className={`${inputClass} [color-scheme:dark] ${!canEditPlanning ? 'opacity-70 cursor-not-allowed' : ''}`} />
                {remainingDays !== null && !readOnly && (
                  <p className={`text-xs mt-1.5 font-medium ${remainingDays < 0 ? 'text-red-400' : remainingDays <= 2 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {remainingDays < 0 ? `Venció hace ${Math.abs(remainingDays)} días` : remainingDays === 0 ? '¡Vence hoy!' : `Quedan ${remainingDays} días`}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 flex items-center gap-1.5">
                  Responsable {!canEditPlanning && !readOnly && <Lock size={10} className="text-gray-500" title="Solo PM" />}
                </label>
                <select name="assigneeId" value={formData.assigneeId} onChange={handleChange} disabled={readOnly || !canEditPlanning} className={`${inputClass} ${!canEditPlanning ? 'opacity-70 cursor-not-allowed' : ''}`}><option value="">Sin asignar</option>{members?.map((m: any) => <option key={m.userId} value={m.userId}>{m.user.name}</option>)}</select>
              </div>

              <div className="pt-2">
                <label className={`flex items-center gap-3 group ${readOnly || !canBlock ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
                  <div className="relative">
                    <input type="checkbox" name="isBlocked" checked={formData.isBlocked} onChange={handleChange} disabled={readOnly || !canBlock} className="sr-only" />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isBlocked ? 'bg-red-500' : 'bg-[#30363d]'}`}></div>
                    <div className={`dot absolute left-1 top-1 w-4 h-4 rounded-full transition-transform ${formData.isBlocked ? 'transform translate-x-4 bg-white' : 'bg-gray-400'}`}></div>
                  </div>
                  <span className={`text-sm font-bold flex items-center gap-1.5 ${formData.isBlocked ? 'text-red-400' : 'text-gray-400'}`}>
                    <AlertCircle size={16} /> Bloqueado {!canBlock && !readOnly && <Lock size={10} className="text-gray-500" title="Solo Tester" />}
                  </span>
                </label>
              </div>

              {task.closedAt && (
                <div className="pt-4 border-t border-[#30363d] mt-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg flex items-center gap-3">
                    <CheckCircle size={20} />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/70">Completada el</p>
                      <p className="text-sm font-bold">{new Date(task.closedAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            <div className="space-y-6 md:col-span-2">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descripción</label>
                <textarea name="description" value={formData.description} onChange={handleChange} disabled={readOnly} placeholder="Añade una descripción más detallada..." className={`${inputClass} h-32 custom-scrollbar resize-none`} />
              </div>

              {!task.parentId && (
                <div className="bg-[#1a1e23] border border-[#30363d] rounded-xl p-4">
                  <h4 className="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center gap-2"><GitCommit size={16}/> Sub-tareas ({subtasks.length})</h4>
                  
                  <div className="space-y-2 mb-3 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                    {subtasks.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">No hay sub-tareas asociadas.</p>
                    ) : (
                      subtasks.map((st: any) => {
                        const stCol = columns.find((c:any) => c.id === st.columnId);
                        const isStDone = stCol?.title.toUpperCase() === 'LISTO' || stCol?.title.toUpperCase() === 'DONE';
                        
                     
                        const canCompleteThis = isAdmin || (st.assigneeId === currentUserId);
                        const isCheckboxDisabled = readOnly || !canCompleteThis;

                        return (
                          <div key={st.id} className={`flex items-center justify-between bg-[#22272b] p-2 rounded border transition-colors ${isCheckboxDisabled ? 'border-[#30363d] opacity-80' : 'border-[#30363d] hover:border-blue-500/50'}`}>
                            <div className="flex items-center gap-3 overflow-hidden">
                              <input
                                type="checkbox"
                                checked={isStDone}
                                onChange={() => onToggleSubtask && onToggleSubtask(st.id, isStDone)}
                                disabled={isCheckboxDisabled}
                                title={!st.assigneeId ? "Debes asignarla primero" : (!canCompleteThis ? "Asignada a otro miembro" : "")}
                                className={`w-4 h-4 rounded accent-emerald-500 shrink-0 ${isCheckboxDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                              />
                              <span onClick={() => setEditingTask(st)} className={`text-sm truncate ${isStDone ? 'text-emerald-400 line-through opacity-70' : 'text-gray-300'} cursor-pointer hover:text-blue-400`}>{st.title}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 shrink-0">
                              
                              <select 
                                value={st.assigneeId || ""} 
                                onChange={(e) => { e.stopPropagation(); onAssignSubtask && onAssignSubtask(st.id, e.target.value); }}
                                disabled={readOnly || !canAssignSubtasks}
                                className="bg-[#1d2125] text-[10px] text-gray-400 border border-[#30363d] rounded px-1.5 py-1 max-w-[90px] outline-none cursor-pointer hover:border-blue-500/50 transition-colors disabled:opacity-50"
                                title={!canAssignSubtasks ? "Sin permisos para asignar" : "Asignar sub-tarea"}
                              >
                                <option value="">Sin asignar</option>
                                {members?.map((m: any) => <option key={m.userId} value={m.userId}>{m.user.name.split(' ')[0]}</option>)}
                              </select>

                              <span className="text-[10px] uppercase font-bold text-gray-500 bg-[#161a1d] px-2 py-0.5 rounded border border-[#30363d]">{stCol?.title || 'Backlog'}</span>
                              {!readOnly && onDeleteSubtask && canAddSubtasks && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); onDeleteSubtask(st.id, st.columnId); }}
                                  className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                                  title="Eliminar Sub-tarea"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>

                  {!readOnly && onAddSubtask && canAddSubtasks && (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newSubtaskTitle} 
                        onChange={(e) => setNewSubtaskTitle(e.target.value)} 
                        onKeyDown={(e) => { if(e.key === 'Enter') handleCreateSubtask(); }} 
                        placeholder="Nueva sub-tarea..." 
                        className="flex-1 bg-[#22272b] border border-[#30363d] text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500"
                      />
                      <button onClick={handleCreateSubtask} disabled={!newSubtaskTitle.trim()} className="bg-[#2c333b] hover:bg-[#3d444d] disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Añadir</button>
                    </div>
                  )}
                  {!canAddSubtasks && !readOnly && <p className="text-[10px] text-gray-500 mt-2">Solo los Desarrolladores o el Tech Lead pueden modificar las sub-tareas.</p>}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-emerald-500/70 uppercase mb-2 flex items-center gap-1.5">
                  <CheckSquare size={14}/> Criterios de Aceptación {!canEditCriteria && !readOnly && <Lock size={10} className="text-emerald-500/50" title="Solo PO" />}
                </label>
                <textarea name="acceptanceCriteria" value={formData.acceptanceCriteria} onChange={handleChange} disabled={readOnly || !canEditCriteria} placeholder="1. El sistema debe permitir..." className={`${inputClass} h-24 custom-scrollbar resize-none ${readOnly || !canEditCriteria ? 'opacity-70' : '!bg-[#1a2024] !border-emerald-900/30 !text-emerald-100/90 focus:!border-emerald-500'}`} />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-400/70 uppercase mb-2 flex items-center gap-1.5">📝 Notas / Comentarios</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleChange} 
                  disabled={readOnly} 
                  placeholder="Agrega enlaces, comentarios o información adicional del avance..." 
                  className={`${inputClass} h-24 custom-scrollbar resize-none ${readOnly ? '' : '!bg-[#161a1d] !border-blue-900/30 !text-blue-100/90 focus:!border-blue-500'}`} 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#30363d] bg-[#1d2125] flex justify-end gap-3 rounded-b-2xl">
          {readOnly ? (
            <button onClick={onClose} className="bg-[#2c333b] hover:bg-[#3d444d] text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors">Cerrar</button>
          ) : (
            <>
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors">Cancelar</button>
              <button onClick={handleSubmit} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]"><Save size={16} /> Guardar Cambios</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}