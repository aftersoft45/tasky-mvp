// app/components/TaskListView.tsx
'use client';

import React, { useState } from 'react';
import { Search, ArrowUpDown, Clock, Calendar } from 'lucide-react';

// determinamos el color segun el tipo de actividad
const getTypeColor = (type: string) => {
  switch(type) {
      case 'Bug': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'Feature': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'Doc': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Artefacto': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'Spike': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-700/50 text-gray-400 border-gray-600/50';
  }
};

// visata de lista de tareas en formato de tabla
export default function TaskListView({ tasks, 
    columns, 
    sprints, 
    epics, 
    onTaskClick }: any) {
  const [searchTerm, setSearchTerm] = useState('');

  // Formateador de fechas
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // filtro de las tareas
  const filteredTasks = tasks.filter((task: any) => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
// renderizado de la tabla
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 relative z-10 custom-scrollbar bg-[#1d2125] animate-in fade-in duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Lista de Actividades</h2>
            <p className="text-gray-400 text-sm mt-1">Todas las tareas de todos los Sprints y del Backlog.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#161a1d] border border-[#30363d] text-sm text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <<!-- tabla para las tareas -->
        <div className="bg-[#161a1d] border border-[#30363d] rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-[#22272b] border-b border-[#30363d] text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-4 py-3 font-medium flex items-center gap-1 cursor-pointer hover:text-white">Tipo / Actividad <ArrowUpDown size={12}/></th>
                  <th className="px-4 py-3 font-medium">Asignado</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Prioridad</th>
                  <th className="px-4 py-3 font-medium">Sprint</th>
                  <th className="px-4 py-3 font-medium">Actualizada</th>
                  <th className="px-4 py-3 font-medium">Vencimiento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500 text-sm">
                      No se encontraron actividades.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task: any) => {
                    const col = columns.find((c: any) => c.id === task.columnId);
                    const sprint = sprints.find((s: any) => s.id === task.sprintId);
                    const epic = epics.find((e: any) => e.id === task.epicId);

                    return (
                      <tr 
                        key={task.id} 
                        onClick={() => onTaskClick(task)}
                        className="hover:bg-[#2c333b]/50 cursor-pointer transition-colors group"
                      >
                        <!-- tipos de actividades -->
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider shrink-0 ${getTypeColor(task.type)}`}>
                              {task.type || 'Task'}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-sm text-white font-medium group-hover:text-emerald-400 transition-colors line-clamp-1">
                                {task.title}
                              </span>
                              {epic && (
                                <span className="text-[10px] text-purple-400 font-bold uppercase mt-0.5">🚀 {epic.name}</span>
                              )}
                            </div>
                          </div>
                        </td>

                        <! -- asignacion -->
                        <td className="px-4 py-3">
                          {task.assignee ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-emerald-900 border border-[#30363d] flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0">
                                {task.assignee.image ? (
                                  <img src={task.assignee.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar" />
                                ) : (
                                  task.assignee.name.charAt(0)
                                )}
                              </div>
                              <span className="text-sm text-gray-300 truncate max-w-[120px]">{task.assignee.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#22272b] border border-[#30363d] border-dashed flex items-center justify-center shrink-0">?</div>
                              Sin asignar
                            </span>
                          )}
                        </td>

                       <!-- estado de la actividad-->
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider ${
                            col?.title.toUpperCase() === 'LISTO' || col?.title.toUpperCase() === 'DONE' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-[#22272b] text-gray-300 border border-[#30363d]'
                          }`}>
                            {col?.title || 'Backlog'}
                          </span>
                        </td>

                        <!--prioridad de la actividad--
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${
                              task.priority === 'Alta' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 
                              task.priority === 'Baja' ? 'bg-blue-500' : 'bg-yellow-500'
                            }`}></span>
                            <span className="text-sm text-gray-300">{task.priority || 'Media'}</span>
                          </div>
                        </td>

                        <!-- sprint al que pertenece -->
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {sprint ? sprint.name : 'Backlog'}
                        </td>

                        <td className="px-4 py-3 text-sm text-gray-400 flex items-center gap-1.5">
                          <Clock size={14} className="opacity-50" /> {formatDate(task.updatedAt)}
                        </td>

                        <!--fecha limite de entrega-->
                        <td className="px-4 py-3">
                          <span className={`text-sm flex items-center gap-1.5 ${task.dueDate ? 'text-gray-300' : 'text-gray-600'}`}>
                            <Calendar size={14} className="opacity-50" /> {formatDate(task.dueDate)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}