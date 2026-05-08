// app/workspace/[id]/TaskyspaceClient.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layout, Users, Plus, Search, Target, Trash2, ExternalLink, User as UserIcon, X, ChevronDown, BarChart2, CheckCircle, Clock, ArchiveRestore, AlertCircle, AlertTriangle, ListTodo, Play, Check, Layers, List, Menu, GitCommit } from 'lucide-react';
import UserProfileMenu from '../../components/UserProfileMenu';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import TaskModal from '../../components/TaskModal';
import TaskListView from '../../components/TaskListView';
import EpicModal from '../../components/EpicModal'; 

const getRoleBadgeStyle = (roleName: string) => {
  switch(roleName) {
    case 'Administrador': return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'Product Owner': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Project Manager': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Tech Lead': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    case 'Tester': return 'bg-pink-500/10 text-pink-400 border-pink-500/20';
    case 'DevOps': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    case 'Developer': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    default: return 'bg-gray-800/50 text-gray-400 border border-gray-700/50';
  }
};

const SprintSelector = ({ viewedSprint, sprints, setSelectedSprintId }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const availableSprints = sprints.filter((s:any) => s.status !== 'PLANNED');
  if (availableSprints.length === 0) return null;

  return (
    <div className="relative z-[100]">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 md:gap-3 bg-[#1a1e23] border border-[#30363d] hover:border-emerald-500/50 px-3 md:px-4 py-2.5 rounded-xl text-white font-bold transition-all shadow-sm">
        <span className="truncate max-w-[120px] md:max-w-none">{viewedSprint ? viewedSprint.name : 'Seleccionar Sprint'}</span>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md hidden sm:inline-block ${viewedSprint?.status === 'COMPLETED' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
          {viewedSprint?.status === 'COMPLETED' ? 'Finalizado' : 'Activo'}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''} shrink-0`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 mt-2 w-64 bg-[#161a1d] border border-[#30363d] rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {availableSprints.map((sprint: any) => (
              <button key={sprint.id} onClick={() => { setSelectedSprintId(sprint.id); setIsOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-[#22272b] transition-colors border-b border-[#30363d] last:border-0 ${viewedSprint?.id === sprint.id ? 'bg-emerald-500/10' : ''}`}>
                <span className={`font-bold truncate pr-2 ${viewedSprint?.id === sprint.id ? 'text-emerald-400' : 'text-gray-300'}`}>{sprint.name}</span>
                <span className="text-[10px] uppercase text-gray-500 shrink-0">{sprint.status === 'COMPLETED' ? 'Terminado' : 'Activo'}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const getTypeColor = (type: string) => {
  switch(type) {
      case 'Bug': return 'bg-red-500/20 text-red-400';
      case 'Feature': return 'bg-purple-500/20 text-purple-400';
      case 'Doc': return 'bg-blue-500/20 text-blue-400';
      case 'Artefacto': return 'bg-orange-500/20 text-orange-400';
      case 'Spike': return 'bg-pink-500/20 text-pink-400';
      case 'Sub': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-gray-700/50 text-gray-400';
  }
};

interface TaskyspaceClientProps { space: any; currentUser: any; userRole: string; }

export default function TaskyspaceClient({ space, currentUser, userRole }: TaskyspaceClientProps) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<'resumen' | 'backlog' | 'tablero' | 'miembros' | 'epicas' | 'lista'>('backlog');
  
  const [columns, setColumns] = useState(space.columns || []);
  const [sprints, setSprints] = useState(space.sprints || []);
  const [epics, setEpics] = useState(space.epics || []); 
  
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [showCompletedSprints, setShowCompletedSprints] = useState(false); 

  const [addingTaskToCol, setAddingTaskToCol] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [editingEpic, setEditingEpic] = useState<any | null>(null);
  
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const isAdmin = userRole === 'Administrador';
  const isPM = userRole === 'Project Manager';
  const isPO = userRole === 'Product Owner';
  const isTechLead = userRole === 'Tech Lead';
  
  const canEdit = userRole !== 'Solo Visor'; 
  const canManageSprints = isAdmin || isPM; 
  const canManageBacklog = isAdmin || isPO || isPM; 
  const canApproveDone = isAdmin || isTechLead; 

  useEffect(() => {
    setColumns(space.columns || []);
    setSprints(space.sprints || []);
    setEpics(space.epics || []); 
    setIsMounted(true);
  }, [space]);

  const sortedColumns = [...columns].sort((a: any, b: any) => a.order - b.order);
  const normalColumns = sortedColumns.filter((col: any) => col.title.toUpperCase() !== 'BACKLOG');

  const activeSprint = sprints.find((s: any) => s.status === 'ACTIVE');
  const viewedSprint = sprints.find((s: any) => s.id === (selectedSprintId || activeSprint?.id));
  const isViewedSprintActive = viewedSprint?.status === 'ACTIVE';

  const allTasks = columns.flatMap((c: any) => c.tasks || []);
  const topLevelTasks = allTasks.filter((t: any) => !t.parentId);
  const backlogTasks = topLevelTasks.filter((t: any) => !t.sprintId);
  const viewedSprintTasks = viewedSprint ? topLevelTasks.filter((t: any) => t.sprintId === viewedSprint.id) : [];

  const doneColumn = normalColumns.find((c: any) => ['LISTO', 'DONE', 'COMPLETADO', 'FINALIZADO', 'HECHO'].includes(c.title.toUpperCase().trim())) || (normalColumns.length > 0 ? normalColumns[normalColumns.length - 1] : null);
  
  const doneTasksList = viewedSprintTasks.filter((t: any) => t.columnId === doneColumn?.id);
  const totalSprintTasksCount = viewedSprintTasks.length;
  const doneTasksCount = doneTasksList.length;

  const totalEffortHours = viewedSprintTasks.reduce((sum: number, task: any) => sum + (Number(task.effortHours) || 0), 0);
  const completedEffortHours = doneTasksList.reduce((sum: number, task: any) => sum + (Number(task.effortHours) || 0), 0);
  const pendingEffortHours = totalEffortHours - completedEffortHours;
  
  const progressPercentage = totalEffortHours > 0 ? Math.round((completedEffortHours / totalEffortHours) * 100) : (totalSprintTasksCount === 0 ? 0 : Math.round((doneTasksCount / totalSprintTasksCount) * 100));

  const blockedTasksCount = viewedSprintTasks.filter((t: any) => t.isBlocked).length;
  const highPriorityCount = viewedSprintTasks.filter((t: any) => t.priority === 'Alta' && t.columnId !== doneColumn?.id).length;

  const memberEffort: Record<string, number> = {};
  viewedSprintTasks.forEach((task: any) => {
    if (task.assigneeId && task.columnId !== doneColumn?.id) { 
      memberEffort[task.assigneeId] = (memberEffort[task.assigneeId] || 0) + (Number(task.effortHours) || 0);
    }
  });

  const toggleSubtasks = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const handleToggleSubtaskStatus = async (subtaskId: string, isCurrentlyDone: boolean) => {
    // 🔥 VALIDACIÓN MAESTRA DE SEGURIDAD PARA SUB-TAREAS 🔥
    const st = allTasks.find((t:any) => t.id === subtaskId);
    if (st && !isAdmin) {
      if (!st.assigneeId) {
        return alert("⚠️ Acción bloqueada: Debes asignarte esta sub-tarea antes de poder completarla.");
      }
      if (st.assigneeId !== currentUser.id) {
        return alert("❌ Permiso denegado: Esta sub-tarea está asignada a otro miembro del equipo.");
      }
    }

    if (!canEdit || !doneColumn || normalColumns.length === 0) return;
    
    const targetColumnId = isCurrentlyDone ? normalColumns[0].id : doneColumn.id;
    const closedAt = isCurrentlyDone ? null : new Date().toISOString();

    setColumns((prev: any) => {
      let updatedTask: any = null;
      const newCols = prev.map((col: any) => {
        const taskIndex = col.tasks.findIndex((t: any) => t.id === subtaskId);
        if (taskIndex > -1) {
          updatedTask = { ...col.tasks[taskIndex], columnId: targetColumnId, closedAt };
          return { ...col, tasks: col.tasks.filter((t: any) => t.id !== subtaskId) }; 
        }
        return col;
      });
      if (updatedTask) {
        return newCols.map((col: any) => col.id === targetColumnId ? { ...col, tasks: [...col.tasks, updatedTask] } : col);
      }
      return prev;
    });

    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: subtaskId, columnId: targetColumnId, closedAt })
    });
    router.refresh();
  };

  const handleCreateSprint = async () => {
    if (!canManageSprints) return alert("❌ Solo el Project Manager o Administrador pueden crear Sprints.");
    const name = `Sprint ${sprints.length + 1}`;
    const res = await fetch('/api/sprints', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, taskyspaceId: space.id }) });
    if (res.ok) { const newSprint = await res.json(); setSprints([...sprints, newSprint]); router.refresh(); }
  };

  const handleCreateEpic = async () => {
    if (!canManageBacklog) return alert("❌ Solo PO, PM o Admin pueden crear Épicas.");
    const name = prompt("Escribe el nombre de la nueva Épica (Ej: Sistema de Pagos):");
    if (!name || name.trim() === "") return;
    const res = await fetch('/api/epics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, taskyspaceId: space.id }) });
    if (res.ok) { const newEpic = await res.json(); setEpics([...epics, newEpic]); router.refresh(); }
  };

  const handleSaveEpicDetails = async (epicId: string, updatedData: any) => {
    if (!canManageBacklog) return;
    setEpics((prev: any) => prev.map((e: any) => e.id === epicId ? { ...e, ...updatedData } : e));
    const res = await fetch('/api/epics', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ epicId, ...updatedData }) });
    if (res.ok) router.refresh();
  };

  const handleDeleteEpic = async (epicId: string) => {
    if (!isAdmin) return alert("Solo el Administrador puede borrar Épicas.");
    if (!confirm("⚠️ ¿Eliminar esta Épica? Las tareas asociadas perderán esta etiqueta, pero NO se borrarán.")) return;
    setEpics(epics.filter((e:any) => e.id !== epicId));
    setColumns((prev: any) => prev.map((col: any) => ({ ...col, tasks: col.tasks.map((t: any) => t.epicId === epicId ? { ...t, epicId: null } : t) })));
    await fetch(`/api/epics?epicId=${epicId}`, { method: 'DELETE' });
    router.refresh();
  };

  const handleStartSprint = async (sprintId: string) => {
    if (!canManageSprints) return alert("❌ Solo el Project Manager o Administrador pueden iniciar Sprints.");
    if (activeSprint) return alert("❌ Error: Ya hay un Sprint activo. Debes completarlo antes de iniciar otro.");
    const startDate = new Date(); const endDate = new Date(); endDate.setDate(startDate.getDate() + 14);
    const res = await fetch('/api/sprints', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sprintId, status: 'ACTIVE', startDate, endDate }) });
    if (res.ok) { setSprints(sprints.map((s: any) => s.id === sprintId ? { ...s, status: 'ACTIVE', startDate, endDate } : s)); setSelectedSprintId(sprintId); setActiveView('tablero'); router.refresh(); }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    if (!canManageSprints) return alert("🛡️ Acceso denegado: Solo el Project Manager o Administrador pueden dar por completado un Sprint.");
    const sprintTasks = allTasks.filter((t: any) => t.sprintId === sprintId);
    const incompleteTasks = sprintTasks.filter((t: any) => t.columnId !== doneColumn?.id);
    if (incompleteTasks.length > 0) return alert(`❌ No puedes completar este Sprint. Aún hay ${incompleteTasks.length} tarea(s) fuera de la columna '${doneColumn?.title || 'Listo'}'.`);
    if (!confirm("¿Seguro que quieres dar por completado este sprint?")) return;
    const res = await fetch('/api/sprints', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sprintId, status: 'COMPLETED' }) });
    if (res.ok) { setSprints(sprints.map((s: any) => s.id === sprintId ? { ...s, status: 'COMPLETED' } : s)); setSelectedSprintId(sprintId); setActiveView('tablero'); router.refresh(); }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!canManageSprints) return alert("Solo PM o Admin pueden borrar sprints.");
    if (!confirm("⚠️ ¿Eliminar este Sprint? Las tareas regresarán al Backlog.")) return;
    setSprints(sprints.filter((s:any) => s.id !== sprintId));
    setColumns((prev: any) => prev.map((col: any) => ({ ...col, tasks: col.tasks.map((t: any) => t.sprintId === sprintId ? { ...t, sprintId: null } : t) })));
    await fetch(`/api/sprints?sprintId=${sprintId}`, { method: 'DELETE' }); router.refresh();
  };

  const onDragEndBoard = async (result: any) => {
    if (!isViewedSprintActive) return; 
    const { source, destination, draggableId } = result;
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;

    if (source.droppableId !== destination.droppableId && destination.droppableId === doneColumn?.id) {
      if (!canApproveDone) {
        alert("❌ Movimiento bloqueado: Solo el Tech Lead (o Admin) puede validar y pasar tickets a la columna 'Listo'.");
        return;
      }
    }

    let newColumns = JSON.parse(JSON.stringify(columns));
    let movedTask: any = null;
    for (let col of newColumns) {
      const taskIndex = col.tasks.findIndex((t: any) => t.id === draggableId);
      if (taskIndex > -1) { movedTask = col.tasks.splice(taskIndex, 1)[0]; break; }
    }
    if (!movedTask) return;

    movedTask.columnId = destination.droppableId;

    if (source.droppableId !== destination.droppableId) {
      if (destination.droppableId === doneColumn?.id) {
        const subtasks = allTasks.filter((t: any) => t.parentId === movedTask.id);
        const hasIncomplete = subtasks.some((st: any) => {
          const stCol = columns.find((c:any) => c.id === st.columnId);
          return !(stCol?.title.toUpperCase() === 'LISTO' || stCol?.title.toUpperCase() === 'DONE');
        });

        if (hasIncomplete) {
          alert("❌ Acción bloqueada: No puedes mover esta tarea a 'Listo' porque aún tiene sub-tareas pendientes por completar.");
          return; 
        }
        movedTask.closedAt = new Date().toISOString(); 
      } 
      else if (source.droppableId === doneColumn?.id) { 
        movedTask.closedAt = null; 
      }
    }

    const destCol = newColumns.find((c: any) => c.id === destination.droppableId);
    const sourceCol = newColumns.find((c: any) => c.id === source.droppableId);

    const destSprintTasks = destCol.tasks.filter((t: any) => t.sprintId === viewedSprint?.id && !t.parentId).sort((a: any, b: any) => a.order - b.order);
    const destOtherTasks = destCol.tasks.filter((t: any) => t.sprintId !== viewedSprint?.id || t.parentId); 
    destSprintTasks.splice(destination.index, 0, movedTask);
    destSprintTasks.forEach((t: any, i: number) => t.order = i);
    destCol.tasks = [...destSprintTasks, ...destOtherTasks];

    if (source.droppableId !== destination.droppableId) {
       const sourceSprintTasks = sourceCol.tasks.filter((t: any) => t.sprintId === viewedSprint?.id && !t.parentId).sort((a: any, b: any) => a.order - b.order);
       const sourceOtherTasks = sourceCol.tasks.filter((t: any) => t.sprintId !== viewedSprint?.id || t.parentId);
       sourceSprintTasks.forEach((t: any, i: number) => t.order = i);
       sourceCol.tasks = [...sourceSprintTasks, ...sourceOtherTasks];
    }
    setColumns(newColumns);

    if (canEdit) {
      try {
        const tasksToUpdate: any[] = [];
        destSprintTasks.forEach((t: any) => tasksToUpdate.push({ id: t.id, columnId: destCol.id, order: t.order }));
        if (source.droppableId !== destination.droppableId) {
           const sourceSprintTasks = sourceCol.tasks.filter((t: any) => t.sprintId === viewedSprint?.id && !t.parentId);
           sourceSprintTasks.forEach((t: any) => tasksToUpdate.push({ id: t.id, columnId: sourceCol.id, order: t.order }));
        }
        await fetch('/api/tasks/reorder', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tasks: tasksToUpdate }) });
        
        if (source.droppableId !== destination.droppableId && (destination.droppableId === doneColumn?.id || source.droppableId === doneColumn?.id)) {
            await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: movedTask.id, closedAt: movedTask.closedAt }) });
        }
      } catch (error) { console.error(error); }
    }
  };

  const onDragEndBacklog = async (result: any) => {
    const { source, destination, draggableId } = result;
    if (!destination || source.droppableId === destination.droppableId) return; 

    const newSprintId = destination.droppableId === 'backlog' ? null : destination.droppableId.replace('sprint-', '');
    setColumns((prev: any) => prev.map((col: any) => ({ ...col, tasks: col.tasks.map((t: any) => t.id === draggableId ? { ...t, sprintId: newSprintId } : t) })));
    if (canEdit) fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: draggableId, sprintId: newSprintId === null ? "" : newSprintId }) });
  };

  const handleSaveTaskDetails = async (taskId: string, updatedData: any) => {
    if (!canEdit) return;
    setColumns((prev: any) => prev.map((col: any) => ({ ...col, tasks: col.tasks.map((t: any) => t.id === taskId ? { ...t, ...updatedData } : t) })));
    await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, ...updatedData }) });
    router.refresh();
  };

  const handleCreateTask = async (columnId: string, sprintId: string | null = null) => {
    if (!newTaskTitle.trim() || !canEdit) return;
    const targetColumnId = columnId || (normalColumns.length > 0 ? normalColumns[0].id : null);
    if (!targetColumnId) return alert("Crea una columna en el tablero primero");
    const tempId = Math.random().toString();
    const newTaskObj = { id: tempId, title: newTaskTitle, assignee: null, sprintId, columnId: targetColumnId, parentId: null };
    
    setColumns(columns.map((col: any) => col.id === targetColumnId ? { ...col, tasks: [...col.tasks, newTaskObj] } : col));
    setNewTaskTitle(''); setAddingTaskToCol(null);

    const res = await fetch('/api/tasks', { method: 'POST', body: JSON.stringify({ title: newTaskTitle, columnId: targetColumnId, spaceId: space.id }) });
    if (res.ok) {
      const savedTask = await res.json();
      if (sprintId) {
        await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: savedTask.id, sprintId }) });
        savedTask.sprintId = sprintId;
      }
      setColumns((prev: any) => prev.map((col: any) => col.id === targetColumnId ? { ...col, tasks: col.tasks.map((t: any) => t.id === tempId ? savedTask : t) } : col));
      router.refresh();
    }
  };

  const handleCreateSubtask = async (parentId: string, title: string) => {
    if (!title.trim() || !canEdit) return;
    const parent = allTasks.find((t: any) => t.id === parentId);
    if (!parent) return;

    const tempId = Math.random().toString();
    const newSubtask = { id: tempId, title, assignee: null, sprintId: parent.sprintId, epicId: parent.epicId, columnId: parent.columnId, parentId, type: 'Sub' };
    setColumns((prev: any) => prev.map((col: any) => col.id === parent.columnId ? { ...col, tasks: [...col.tasks, newSubtask] } : col));

    const res = await fetch('/api/tasks', { method: 'POST', body: JSON.stringify({ title, columnId: parent.columnId, spaceId: space.id, parentId, type: 'Sub' }) });
    if (res.ok) {
      const savedTask = await res.json();
      if (parent.sprintId || parent.epicId) {
        await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId: savedTask.id, sprintId: parent.sprintId || null, epicId: parent.epicId || null }) });
        savedTask.sprintId = parent.sprintId;
        savedTask.epicId = parent.epicId;
      }
      setColumns((prev: any) => prev.map((col: any) => col.id === parent.columnId ? { ...col, tasks: col.tasks.map((t: any) => t.id === tempId ? savedTask : t) } : col));
      router.refresh();
    }
  };

  const handleDeleteTask = async (columnId: string, taskId: string) => {
    if (!isAdmin) return;
    if (!confirm("¿Eliminar esta tarea definitivamente?")) return;
    setColumns(columns.map((col: any) => col.id === columnId ? { ...col, tasks: col.tasks.filter((t: any) => t.id !== taskId && t.parentId !== taskId) } : col));
    await fetch(`/api/tasks?taskId=${taskId}`, { method: 'DELETE' }); router.refresh();
  };

  const handleDeleteSubtask = async (subtaskId: string, columnId: string) => {
    if (!canEdit) return;
    if (!confirm("¿Eliminar esta sub-tarea definitivamente?")) return;
    
    setColumns((prev: any) => prev.map((col: any) => col.id === columnId ? { ...col, tasks: col.tasks.filter((t: any) => t.id !== subtaskId) } : col));
    await fetch(`/api/tasks?taskId=${subtaskId}`, { method: 'DELETE' });
    router.refresh();
  };

  const handleAssignTask = async (columnId: string, taskId: string, assigneeId: string) => {
    const targetTask = allTasks.find((t:any) => t.id === taskId);
    const isSubtask = !!targetTask?.parentId;

    // 🔥 FILTRO DE SEGURIDAD PARA ASIGNACIONES 🔥
    if (!isAdmin && !isPM) {
      if (isSubtask) {
        // En sub-tareas, dejamos que el TechLead asigne a quien sea.
        // Si es un Developer normal, solo puede auto-asignárselo.
        if (!isTechLead && assigneeId !== currentUser.id && assigneeId !== "") {
           return alert("❌ Solo puedes asignarte la sub-tarea a ti mismo. Deja que el Tech Lead asigne a otros.");
        }
      } else {
        return alert("❌ Permiso denegado: Solo el Project Manager puede reasignar los tickets principales.");
      }
    }

    const newAssigneeMember = space.members.find((m: any) => m.userId === assigneeId);
    const newAssignee = newAssigneeMember ? newAssigneeMember.user : null;
    
    setColumns((prev: any) => prev.map((col: any) => col.id === columnId ? { ...col, tasks: col.tasks.map((t: any) => t.id === taskId ? { ...t, assigneeId, assignee: newAssignee } : t) } : col));
    const res = await fetch('/api/tasks', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, assigneeId }) });
    if (res.ok) {
      const updatedTask = await res.json();
      setColumns((prev: any) => prev.map((col: any) => col.id === columnId ? { ...col, tasks: col.tasks.map((t: any) => t.id === taskId ? updatedTask : t) } : col));
      router.refresh();
    }
  };

  const handleCreateColumn = async (forcedTitle?: string) => {
    const titleToSave = forcedTitle || newColumnTitle.trim();
    if (!titleToSave || !canEdit) return;
    const tempId = Math.random().toString();
    setColumns([...columns, { id: tempId, title: titleToSave, tasks: [], order: columns.length }]);
    setNewColumnTitle(''); setIsAddingColumn(false);
    const res = await fetch('/api/columns', { method: 'POST', body: JSON.stringify({ title: titleToSave, spaceId: space.id, order: columns.length }) });
    if (res.ok) {
      const savedCol = await res.json();
      setColumns((prev: any) => prev.map((c: any) => c.id === tempId ? savedCol : c)); router.refresh();
    }
  };

  const BacklogRow = ({ task, index }: { task: any, index: number }) => {
    const epic = epics.find((e: any) => e.id === task.epicId);
    const subtasks = allTasks.filter((t: any) => t.parentId === task.id);
    const hasSubtasks = subtasks.length > 0;
    const isExpanded = expandedTasks[task.id];
    
    const isDragDisabled = !canManageBacklog;
    
    return (
      <Draggable draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`mb-2 ${snapshot.isDragging ? 'z-50' : ''}`}>
            <div onClick={() => setEditingTask(task)} className={`flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4 bg-[#22272b] p-3 rounded-lg border border-[#30363d] hover:border-emerald-500/50 cursor-pointer transition-colors ${snapshot.isDragging ? 'shadow-xl border-emerald-500' : ''} ${isExpanded ? 'rounded-b-none border-b-0' : ''} ${isDragDisabled ? 'opacity-90 hover:border-gray-500 cursor-pointer' : ''}`}>
              <div className="flex flex-col gap-1 w-20 sm:w-24 shrink-0">
                <span className={`text-[9px] w-max px-2 py-0.5 rounded font-bold uppercase ${getTypeColor(task.type)}`}>{task.type || 'Task'}</span>
                {epic && <span className="text-[8px] truncate px-1.5 py-0.5 rounded border border-purple-500/50 bg-purple-500/10 text-purple-300 font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.4)]">🚀 {epic.name}</span>}
              </div>
              <p className="text-sm text-white flex-1 min-w-[150px] truncate">{task.title}</p>
              
              <div className="flex items-center gap-3 shrink-0 ml-auto">
                {hasSubtasks && (
                  <button onClick={(e) => toggleSubtasks(task.id, e)} className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold transition-colors ${isExpanded ? 'bg-blue-500/20 text-blue-400' : 'bg-[#161a1d] text-gray-400 hover:text-white'}`}>
                    <GitCommit size={14}/> {subtasks.length}
                  </button>
                )}
                {task.priority && <span title={task.priority} className={`w-2.5 h-2.5 rounded-full ${task.priority === 'Alta' ? 'bg-red-500' : task.priority === 'Baja' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>}
                <span className="text-xs font-bold text-gray-500 bg-[#161a1d] px-2 py-1 rounded-md flex items-center"><Clock size={12} className="mr-1"/>{task.effortHours || 0}h</span>
                <div className="w-6 h-6 rounded-full bg-emerald-900 border border-[#30363d] flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                  {task.assignee ? (task.assignee.image ? <img src={task.assignee.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar" /> : task.assignee.name.charAt(0)) : '?'}
                </div>
              </div>
            </div>
            
            {isExpanded && hasSubtasks && (
              <div className="bg-[#1a1e23] border border-[#30363d] border-t-0 rounded-b-lg p-2 pl-8 space-y-1">
                {subtasks.map((st: any) => {
                  const stCol = columns.find((c:any) => c.id === st.columnId);
                  const isStDone = stCol?.title.toUpperCase() === 'LISTO' || stCol?.title.toUpperCase() === 'DONE';
                  
                  // 🔥 SEGURO EN UI EXTERNA: Checkbox bloqueado si no es tuyo o no tiene dueño
                  const canCompleteThis = isAdmin || (st.assigneeId === currentUser.id);
                  const isCheckboxDisabled = !canEdit || !canCompleteThis;

                  return (
                    <div key={st.id} className="flex items-center justify-between bg-[#22272b] border border-[#30363d] p-2 rounded hover:border-blue-500/50 group transition-colors">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <input
                          type="checkbox"
                          checked={isStDone}
                          onChange={(e) => { e.stopPropagation(); handleToggleSubtaskStatus(st.id, isStDone); }}
                          disabled={isCheckboxDisabled}
                          title={!st.assigneeId ? "Debes asignarla primero" : (!canCompleteThis ? "Asignada a otro miembro" : "")}
                          className={`w-4 h-4 rounded accent-emerald-500 shrink-0 ${isCheckboxDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                        <span onClick={() => setEditingTask(st)} className={`text-xs truncate cursor-pointer hover:text-blue-400 ${isStDone ? 'text-emerald-400 line-through opacity-70' : 'text-gray-300'}`}>{st.title}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold text-gray-500 bg-[#161a1d] px-1.5 py-0.5 rounded shrink-0">{stCol?.title || 'Backlog'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  const TaskCard = ({ task, colId, index }: { task: any, colId: string, index: number }) => {
    const isDropdownActive = activeDropdown === task.id;
    const epic = epics.find((e: any) => e.id === task.epicId);
    const subtasks = allTasks.filter((t: any) => t.parentId === task.id);
    const hasSubtasks = subtasks.length > 0;
    const isExpanded = expandedTasks[task.id];
    
    const isMyTask = task.assigneeId === currentUser.id;
    const canDragThisTask = isAdmin || isPM || isTechLead || isMyTask;
    const isDragDisabled = !canDragThisTask || !isViewedSprintActive;

    return (
      <Draggable draggableId={task.id} index={index} isDragDisabled={isDragDisabled}>
        {(provided, snapshot) => {
          const draggableStyle = { ...provided.draggableProps.style, zIndex: isDropdownActive ? 9999 : (snapshot.isDragging ? 50 : 1) };
          return (
            <div 
              ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} onClick={() => setEditingTask(task)} 
              className={`bg-[#22272b] p-3 rounded-lg border shadow-sm group transition-all relative ${snapshot.isDragging ? 'border-emerald-500 shadow-emerald-500/20 shadow-xl scale-105 rotate-2 cursor-grabbing' : 'border-[#30363d] hover:border-emerald-500/50 cursor-pointer'} ${task.isBlocked ? 'border-red-900/50 bg-red-950/10' : ''} ${isDragDisabled ? 'opacity-80 hover:opacity-100 hover:border-[#30363d] cursor-pointer' : ''}`}
              style={draggableStyle}
            >
              {isAdmin && isViewedSprintActive && <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(colId, task.id); }} className="absolute top-2 right-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity z-10"><Trash2 size={14} /></button>}
              
              <div className="flex gap-2 items-center mb-2 flex-wrap pr-4">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${getTypeColor(task.type)}`}>{task.type || 'Task'}</span>
                  {epic && (
                    <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-purple-500/50 bg-purple-500/10 text-purple-300 font-extrabold shadow-[0_0_10px_rgba(168,85,247,0.4)] truncate max-w-[120px]">
                      🚀 {epic.name}
                    </span>
                  )}
                  <span title={`Prioridad: ${task.priority || 'Media'}`} className={`ml-auto w-2 h-2 rounded-full shrink-0 ${task.priority === 'Alta' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : task.priority === 'Baja' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                  {task.isBlocked && <AlertCircle size={14} className="text-red-400 shrink-0" title="¡Bloqueado!" />}
              </div>
              <p className="text-sm text-white mb-3 pr-2 leading-relaxed select-none">{task.title}</p>
              
              {isExpanded && hasSubtasks && (
                <div className="mb-3 bg-[#1a1e23] border border-[#30363d] rounded p-1.5 space-y-1" onClick={e => e.stopPropagation()}>
                  {subtasks.map((st: any) => {
                    const stCol = columns.find((c:any) => c.id === st.columnId);
                    const stDone = stCol?.title.toUpperCase() === 'LISTO' || stCol?.title.toUpperCase() === 'DONE';
                    
                    // 🔥 SEGURO EN UI EXTERNA: Checkbox bloqueado si no es tuyo o no tiene dueño
                    const canCompleteThis = isAdmin || (st.assigneeId === currentUser.id);
                    const isCheckboxDisabled = !canEdit || !canCompleteThis;

                    return (
                      <div key={st.id} className="flex items-center justify-between bg-[#22272b] p-1.5 rounded border border-[#30363d] hover:border-blue-500/50 transition-colors">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <input
                            type="checkbox"
                            checked={stDone}
                            onChange={(e) => { e.stopPropagation(); handleToggleSubtaskStatus(st.id, stDone); }}
                            disabled={isCheckboxDisabled}
                            title={!st.assigneeId ? "Debes asignarla primero" : (!canCompleteThis ? "Asignada a otro miembro" : "")}
                            className={`w-3.5 h-3.5 rounded accent-emerald-500 shrink-0 ${isCheckboxDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          />
                          <span onClick={() => setEditingTask(st)} className={`text-xs truncate pr-2 cursor-pointer hover:text-blue-400 ${stDone ? 'text-gray-500 line-through' : 'text-gray-300'}`}>{st.title}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#30363d] pt-2 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-500 flex items-center gap-1 bg-[#1a1e23] px-2 py-1 rounded-md border border-[#30363d]"><Clock size={12}/> {task.effortHours || 0}h</span>
                  {hasSubtasks && (
                    <button onClick={(e) => toggleSubtasks(task.id, e)} className={`flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-bold transition-colors ${isExpanded ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-[#1a1e23] text-gray-500 border border-[#30363d] hover:text-white'}`}>
                      <GitCommit size={12}/> {subtasks.length}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin || isPM ? (
                    <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(isDropdownActive ? null : task.id); }} className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400 transition-colors"><span className="max-w-[70px] truncate font-medium">{task.assignee ? task.assignee.name.split(' ')[0] : 'Sin asignar'}</span><ChevronDown size={12} className={`opacity-50 transition-transform ${isDropdownActive ? 'rotate-180' : ''}`} /></button>
                  ) : (<span className="text-xs text-gray-500 max-w-[70px] truncate">{task.assignee ? task.assignee.name.split(' ')[0] : 'Sin asignar'}</span>)}
                  
                  {task.assignee && (
                    <div className="w-6 h-6 rounded-full bg-emerald-900 border border-[#30363d] flex items-center justify-center text-[10px] font-bold text-white overflow-hidden shrink-0" title={task.assignee.name}>
                        {task.assignee.image ? <img src={task.assignee.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar"/> : task.assignee.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              
              {isDropdownActive && (isAdmin || isPM) && (
                <div className="mt-3 pt-3 border-t border-[#30363d] w-full animate-in slide-in-from-top-1 duration-200 cursor-default" onClick={(e) => e.stopPropagation()}>
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">Asignar miembro</div>
                  <button onClick={() => { handleAssignTask(colId, task.id, ""); setActiveDropdown(null); }} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-colors mb-1 font-medium">Quitar asignación</button>
                  <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-1 pr-1">
                    {space.members.map((m: any) => (
                      <button key={m.userId} onClick={() => { handleAssignTask(colId, task.id, m.userId); setActiveDropdown(null); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:bg-emerald-500/10 hover:text-emerald-400 rounded-lg transition-colors">
                        <div className="w-5 h-5 rounded-full bg-emerald-900 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden shrink-0 border border-[#30363d]"><img src={m.user.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar"/></div>
                        <span className="truncate">{m.user.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </Draggable>
    );
  };

  if (!isMounted) return null;

  const isEditingTaskReadOnly = editingTask?.sprintId ? sprints.find((s:any) => s.id === editingTask.sprintId)?.status === 'COMPLETED' : false;

  return (
    <>
      {editingTask && (
        <TaskModal 
          task={editingTask}
          allTasks={allTasks}
          columns={columns}
          onClose={() => setEditingTask(null)} 
          onSave={handleSaveTaskDetails}
          onAddSubtask={handleCreateSubtask} 
          onToggleSubtask={handleToggleSubtaskStatus} 
          onDeleteSubtask={handleDeleteSubtask}
          onAssignSubtask={(subtaskId: string, newAssigneeId: string) => {
            const st = allTasks.find((t: any) => t.id === subtaskId);
            if (st) handleAssignTask(st.columnId, subtaskId, newAssigneeId);
          }}
          members={space.members}
          epics={epics} 
          readOnly={isEditingTaskReadOnly}
          currentUserRole={userRole} 
          currentUserId={currentUser.id} 
        />
      )}

      {editingEpic && (
        <EpicModal 
          epic={editingEpic}
          tasks={allTasks.filter((t: any) => t.epicId === editingEpic.id)}
          columns={columns}
          onClose={() => setEditingEpic(null)}
          onSave={handleSaveEpicDetails}
          readOnly={!canManageBacklog}
        />
      )}

      <div className="flex h-screen bg-[#1d2125] text-[#c9d1d9] font-sans overflow-hidden selection:bg-emerald-500/30 selection:text-emerald-200">
        
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <aside className={`w-64 bg-[#161a1d] border-r border-[#30363d] flex flex-col shrink-0 fixed md:relative z-50 md:z-20 h-full transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
          <div className="h-16 flex items-center justify-between md:justify-start gap-3 px-4 border-b border-[#30363d]">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)] shrink-0">{space.name.charAt(0).toUpperCase()}</div>
              <div className="overflow-hidden"><h2 className="text-white font-bold truncate text-sm">{space.name}</h2><p className="text-xs text-emerald-500 truncate font-medium">Rol: {userRole}</p></div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-white p-1"><X size={20} /></button>
          </div>
          
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            <p className="text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wider">Planificación</p>
            <button onClick={() => { setActiveView('resumen'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${activeView === 'resumen' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-[#2c333b]'}`}><BarChart2 size={16} /> Resumen</button>
            <button onClick={() => { setActiveView('backlog'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${activeView === 'backlog' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-[#2c333b]'}`}><ListTodo size={16} /> Backlog & Sprints</button>
            <button onClick={() => { setActiveView('tablero'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${activeView === 'tablero' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-[#2c333b]'}`}><Layout size={16} /> Tablero Activo</button>
            <button onClick={() => { setActiveView('lista'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${activeView === 'lista' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-[#2c333b]'}`}><List size={16} className={activeView === 'lista' ? 'text-emerald-400' : ''} /> Ver en Lista</button>
            <button onClick={() => { setActiveView('epicas'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${activeView === 'epicas' ? 'text-purple-400 bg-purple-500/10 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]' : 'text-gray-400 hover:text-white hover:bg-[#2c333b]'}`}><Layers size={16} className={activeView === 'epicas' ? 'text-purple-400' : ''} /> Mapa de Épicas</button>
            
            <p className="text-xs font-bold text-gray-500 px-3 py-2 uppercase tracking-wider mt-4">Gestión</p>
            <button onClick={() => { setActiveView('miembros'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg font-medium transition-colors ${activeView === 'miembros' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-gray-400 hover:text-white hover:bg-[#2c333b]'}`}><Users size={16} /> Equipo</button>
          </nav>
          <div className="p-4 border-t border-[#30363d]"><Link href="/workspace" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"><Target size={16} /> Volver al directorio</Link></div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
          
          <header className="h-16 px-4 md:px-6 border-b border-[#30363d] flex items-center justify-between shrink-0 relative z-30 bg-[#1d2125]/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 flex-1">
              <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-1.5 text-gray-400 hover:text-white bg-[#161a1d] border border-[#30363d] rounded-lg">
                <Menu size={20} />
              </button>
              <div className="relative w-full max-w-md hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input type="text" placeholder="Buscar..." className="w-full bg-[#161a1d] border border-[#30363d] text-sm text-white rounded-md pl-10 pr-4 py-1.5 focus:outline-none focus:border-emerald-500 transition-all"/>
              </div>
            </div>
            <div className="flex items-center gap-4"><UserProfileMenu user={currentUser} /></div>
          </header>

          {activeView === 'epicas' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-10 relative z-10 custom-scrollbar bg-[#1d2125] animate-in fade-in duration-300">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3"><Layers className="text-purple-500" size={28} /> Mapa de Épicas</h2>
                    <p className="text-gray-400 mt-2 text-sm md:text-base">Visualiza el progreso de las grandes iniciativas de tu proyecto.</p>
                  </div>
                  {canManageBacklog && (
                    <button onClick={handleCreateEpic} className="w-full md:w-auto bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2"><Plus size={18} /> Nueva Épica</button>
                  )}
                </div>

                {epics.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-8 md:p-16 bg-[#161a1d] border border-dashed border-[#30363d] rounded-2xl">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-4"><Layers size={28} className="text-purple-500" /></div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">No tienes Épicas activas</h3>
                    <p className="text-gray-400 max-w-sm mb-6 text-sm md:text-base">Las Épicas te ayudan a agrupar tareas bajo un mismo objetivo gigante.</p>
                    {canManageBacklog && <button onClick={handleCreateEpic} className="text-purple-400 hover:text-purple-300 font-bold border-b border-purple-500 pb-1">Crear mi primera Épica</button>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {epics.map((epic: any) => {
                      const epicTasks = allTasks.filter((t: any) => t.epicId === epic.id);
                      const completedEpicTasks = epicTasks.filter((t: any) => t.columnId === doneColumn?.id);
                      const totalEpicEffort = epicTasks.reduce((sum: number, task: any) => sum + (Number(task.effortHours) || 0), 0);
                      const burnedEpicEffort = completedEpicTasks.reduce((sum: number, task: any) => sum + (Number(task.effortHours) || 0), 0);
                      const progress = epicTasks.length > 0 ? Math.round((completedEpicTasks.length / epicTasks.length) * 100) : 0;

                      return (
                        <div key={epic.id} onClick={() => setEditingEpic(epic)} className="bg-[#161a1d] border border-[#30363d] hover:border-purple-500/50 rounded-2xl p-5 md:p-6 transition-all group relative overflow-hidden shadow-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.1)] cursor-pointer">
                          <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-purple-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>
                          <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                              <div className="flex items-center gap-2 mb-1"><span className="bg-purple-500/20 text-purple-400 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border border-purple-500/30">Épica</span></div>
                              <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2">{epic.name}</h3>
                            </div>
                            {isAdmin && <button onClick={(e) => { e.stopPropagation(); handleDeleteEpic(epic.id); }} className="text-gray-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors shrink-0"><Trash2 size={16} /></button>}
                          </div>
                          <div className="space-y-4 relative z-10">
                            <div>
                              <div className="flex justify-between text-xs md:text-sm mb-1.5"><span className="text-gray-400">Tickets finalizados</span><span className="text-white font-bold">{completedEpicTasks.length} / {epicTasks.length}</span></div>
                              <div className="w-full bg-[#22272b] rounded-full h-2 overflow-hidden border border-[#30363d]"><div className="bg-gradient-to-r from-purple-600 to-fuchsia-400 h-2 rounded-full transition-all duration-1000 relative" style={{ width: `${progress}%` }}><div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div></div></div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-[#30363d]">
                              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-400"><Clock size={14} className="text-purple-400/70" /><span>Esfuerzo Quemado</span></div>
                              <div className="text-right"><span className="text-white font-bold">{burnedEpicEffort}h</span><span className="text-gray-500 text-xs ml-1">/ {totalEpicEffort}h</span></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeView === 'resumen' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 custom-scrollbar animate-in fade-in duration-300">
              <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">Resumen Ágil del Sprint</h1>
                  <div className="flex items-center mb-6 border-b border-[#30363d] pb-4"><SprintSelector viewedSprint={viewedSprint} sprints={sprints} setSelectedSprintId={setSelectedSprintId} /></div>
                  {!viewedSprint ? (<p className="text-gray-400 text-yellow-500 font-medium text-sm md:text-base">⚠️ No hay ningún Sprint para analizar en este momento.</p>) : (
                    <>
                      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-[#161a1d] p-4 md:p-5 rounded-2xl border border-[#30363d] shadow-lg relative overflow-hidden">
                          <div className="flex justify-between items-start mb-2"><div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400"><Clock size={18} /></div><span className="text-[10px] md:text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">{totalEffortHours}h Total</span></div>
                          <p className="text-xs md:text-sm text-gray-400 font-medium">Esfuerzo Quemado</p><p className="text-xl md:text-2xl font-bold text-white">{completedEffortHours} <span className="text-xs md:text-sm text-gray-500 font-medium">hrs</span></p>
                        </div>
                        <div className="bg-[#161a1d] p-4 md:p-5 rounded-2xl border border-[#30363d] shadow-lg relative overflow-hidden">
                          <div className="flex justify-between items-start mb-2"><div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400"><CheckCircle size={18} /></div><span className="text-[10px] md:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{totalSprintTasksCount} Sprint</span></div>
                          <p className="text-xs md:text-sm text-gray-400 font-medium">Tickets Listos</p><p className="text-xl md:text-2xl font-bold text-white">{doneTasksCount}</p>
                        </div>
                        <div className={`p-4 md:p-5 rounded-2xl border shadow-lg relative overflow-hidden ${blockedTasksCount > 0 ? 'bg-red-950/20 border-red-900/50' : 'bg-[#161a1d] border-[#30363d]'}`}>
                          <div className="flex justify-between items-start mb-2"><div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${blockedTasksCount > 0 ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/10 text-yellow-400'}`}>{blockedTasksCount > 0 ? <AlertCircle size={18} /> : <AlertTriangle size={18} />}</div><span className={`text-[10px] md:text-xs font-bold px-2 py-1 rounded-md ${highPriorityCount > 0 ? 'text-red-400 bg-red-500/10' : 'text-gray-400 bg-[#2c333b]'}`}>{highPriorityCount} P0/P1</span></div>
                          <p className="text-xs md:text-sm text-gray-400 font-medium">Bloqueados</p><p className={`text-xl md:text-2xl font-bold ${blockedTasksCount > 0 ? 'text-red-400' : 'text-white'}`}>{blockedTasksCount}</p>
                        </div>
                        <div className="bg-[#161a1d] p-4 md:p-5 rounded-2xl border border-[#30363d] shadow-lg relative overflow-hidden">
                          <div className="flex justify-between items-start mb-2"><div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400"><Users size={18} /></div><span className="text-[10px] md:text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-md">Total</span></div>
                          <p className="text-xs md:text-sm text-gray-400 font-medium">Miembros</p><p className="text-xl md:text-2xl font-bold text-white">{space.members.length}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8">
                        <div className="bg-[#161a1d] p-5 md:p-8 rounded-2xl border border-[#30363d] shadow-lg">
                          <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2"><Target className="text-emerald-400" size={18}/> Velocidad del Sprint</h3>
                          <div className="flex items-end justify-between mb-2"><span className="text-3xl md:text-4xl font-extrabold text-white">{progressPercentage}%</span><span className="text-xs md:text-sm text-gray-400 font-medium">{pendingEffortHours} horas pendientes</span></div>
                          <div className="w-full h-3 md:h-4 bg-[#22272b] rounded-full overflow-hidden border border-[#30363d]"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-1000 ease-out relative" style={{ width: `${progressPercentage}%` }}>{isViewedSprintActive && <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>}</div></div>
                          <div className="mt-6 md:mt-8 space-y-3"><p className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Distribución por Estado</p>{sortedColumns.map((col: any) => { const countInSprint = viewedSprintTasks.filter((t:any) => t.columnId === col.id).length; return (<div key={col.id} className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${col.id === doneColumn?.id ? 'bg-emerald-500' : 'bg-gray-500'}`}></div><span className="text-xs md:text-sm text-gray-300 font-medium">{col.title}</span></div><span className="text-xs md:text-sm font-bold text-white bg-[#22272b] px-2 py-0.5 rounded border border-[#30363d]">{countInSprint} tickets</span></div>)})}</div>
                        </div>
                        <div className="bg-[#161a1d] p-5 md:p-8 rounded-2xl border border-[#30363d] shadow-lg">
                          <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 flex items-center gap-2"><Clock className="text-cyan-400" size={18}/> Carga Activa</h3>
                          <div className="space-y-4 md:space-y-5">
                            {space.members.map((m: any) => {
                              const userHours = memberEffort[m.userId] || 0;
                              const activeEffort = totalEffortHours - completedEffortHours;
                              const userPercentage = activeEffort === 0 ? 0 : Math.round((userHours / activeEffort) * 100);
                              return (
                                <div key={m.userId} className="group">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 md:gap-3"><div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-emerald-900 border border-[#30363d] flex items-center justify-center text-[10px] md:text-xs font-bold text-white overflow-hidden shrink-0">{m.user.image ? <img src={m.user.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar"/> : m.user.name.charAt(0)}</div><span className="text-xs md:text-sm text-gray-300 font-medium group-hover:text-white transition-colors truncate max-w-[100px] md:max-w-none">{m.user.name}</span></div><span className="text-xs md:text-sm font-bold text-emerald-400">{userHours}h</span>
                                  </div>
                                  <div className="w-full h-1 md:h-1.5 bg-[#22272b] rounded-full overflow-hidden"><div className="h-full bg-cyan-500/80 rounded-full transition-all duration-1000" style={{ width: `${userPercentage}%` }}></div></div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeView === 'backlog' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar relative z-10 bg-[#1d2125]">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6 md:mb-8">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">Backlog de Tareas</h2>
                    <p className="text-gray-400 mt-1 text-sm md:text-base">Planea tus Sprints arrastrando tareas hacia ellos.</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                     {isAdmin && sprints.some((s:any) => s.status === 'COMPLETED') && (
                        <button onClick={() => setShowCompletedSprints(!showCompletedSprints)} className="flex-1 md:flex-none justify-center bg-[#161a1d] hover:bg-[#2c333b] border border-[#30363d] text-gray-400 px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all">
                          {showCompletedSprints ? 'Ocultar Finalizados' : 'Ver Finalizados'}
                        </button>
                     )}
                     {canManageSprints && <button onClick={handleCreateSprint} className="flex-1 md:flex-none justify-center bg-[#2c333b] hover:bg-[#3d444d] border border-[#30363d] text-white px-3 py-2 rounded-lg text-xs md:text-sm font-bold transition-all">Crear Sprint</button>}
                  </div>
                </div>

                <DragDropContext onDragEnd={onDragEndBacklog}>
                  {sprints.filter((s:any) => showCompletedSprints ? true : s.status !== 'COMPLETED').map((sprint: any) => {
                    const tasksInSprint = topLevelTasks.filter((t: any) => t.sprintId === sprint.id);                    return (
                      <div key={sprint.id} className={`mb-6 md:mb-8 bg-[#161a1d] border rounded-xl overflow-hidden ${sprint.status === 'ACTIVE' ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-[#30363d]'} ${sprint.status === 'COMPLETED' ? 'opacity-60 grayscale' : ''}`}>
                        <div className="bg-[#1d2125] p-3 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#30363d]">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
                            <h3 className="text-base md:text-lg font-bold text-white">{sprint.name}</h3>
                            {sprint.status === 'ACTIVE' && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 md:py-1 rounded font-bold uppercase">Activo</span>}
                            {sprint.status === 'COMPLETED' && <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-0.5 md:py-1 rounded font-bold uppercase">Finalizado</span>}
                            <span className="text-[10px] md:text-xs text-gray-500 font-medium ml-auto sm:ml-0">{tasksInSprint.length} tickets</span>
                          </div>
                          
                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {isAdmin && sprint.status === 'PLANNED' && <button onClick={() => handleDeleteSprint(sprint.id)} title="Eliminar Sprint" className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"><Trash2 size={16}/></button>}
                            {canManageSprints && sprint.status === 'PLANNED' && <button onClick={() => handleStartSprint(sprint.id)} disabled={tasksInSprint.length === 0} className="w-full sm:w-auto justify-center bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-neutral-950 px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-bold flex items-center gap-1.5"><Play size={14}/> Iniciar Sprint</button>}
                            {canManageSprints && sprint.status === 'ACTIVE' && <button onClick={() => handleCompleteSprint(sprint.id)} className="w-full sm:w-auto justify-center bg-blue-500 hover:bg-blue-400 text-white px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-bold flex items-center gap-1.5"><Check size={14}/> Completar Sprint</button>}
                          </div>
                        </div>
                        
                        <Droppable droppableId={`sprint-${sprint.id}`} isDropDisabled={sprint.status === 'COMPLETED'}>
                          {(provided, snapshot) => (
                            <div ref={provided.innerRef} {...provided.droppableProps} className={`p-3 md:p-4 min-h-[80px] md:min-h-[100px] transition-colors ${snapshot.isDraggingOver ? 'bg-[#22272b]/50' : ''}`}>
                              {tasksInSprint.length === 0 && <p className="text-xs md:text-sm text-gray-500 text-center py-4 border-2 border-dashed border-[#30363d] rounded-lg mx-1">Arrastra tareas aquí para planear el sprint</p>}
                              {tasksInSprint.map((task: any, index: number) => <BacklogRow key={task.id} task={task} index={index} />)}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}

                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-3 md:mb-4 px-1 md:px-2">
                      <h3 className="text-base md:text-lg font-bold text-white flex items-center gap-2">Cajón de Backlog <span className="text-[10px] md:text-xs bg-[#2c333b] text-gray-400 px-2 py-0.5 rounded-md">{backlogTasks.length}</span></h3>
                    </div>
                    <Droppable droppableId="backlog">
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className={`bg-[#161a1d] border border-[#30363d] rounded-xl p-3 md:p-4 min-h-[120px] md:min-h-[150px] transition-colors ${snapshot.isDraggingOver ? 'bg-[#22272b]/50' : ''}`}>
                          {backlogTasks.length === 0 && <p className="text-xs md:text-sm text-gray-500 text-center py-6 md:py-8">Tu backlog está vacío.</p>}
                          {backlogTasks.map((task: any, index: number) => <BacklogRow key={task.id} task={task} index={index} />)}
                          {provided.placeholder}
                          
                          {canEdit && (
                             <div className="mt-2">
                               {addingTaskToCol === 'backlog-create' ? (
                                 <input autoFocus type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleCreateTask(''); if(e.key === 'Escape') setAddingTaskToCol(null); }} onBlur={() => setAddingTaskToCol(null)} placeholder="Escribe y presiona Enter..." className="w-full bg-[#22272b] border border-emerald-500 text-xs md:text-sm text-white rounded-lg px-3 md:px-4 py-2 outline-none"/>
                               ) : (
                                 <button onClick={() => setAddingTaskToCol('backlog-create')} className="w-full text-left text-xs md:text-sm text-gray-400 hover:text-white bg-[#22272b] hover:bg-[#2c333b] border border-dashed border-[#30363d] rounded-lg px-3 md:px-4 py-2 transition-colors flex items-center gap-2"><Plus size={14} className="md:w-4 md:h-4"/> Crear idea en Backlog</button>
                               )}
                             </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </DragDropContext>
              </div>
            </div>
          )}

          {activeView === 'tablero' && (
            <div className="flex-1 flex flex-col overflow-hidden relative z-10 bg-[#1d2125]">
              {sprints.filter((s:any) => s.status !== 'PLANNED').length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 md:p-8">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-[#161a1d] rounded-full flex items-center justify-center mb-4 md:mb-6 border border-[#30363d]"><ArchiveRestore size={32} className="text-gray-500 md:w-10 md:h-10" /></div>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">No hay ningún Sprint iniciado</h2>
                  <p className="text-gray-400 max-w-sm md:max-w-md mb-6 text-sm md:text-base">Ve al Backlog, planea tus tareas y presiona "Iniciar Sprint" para que aparezcan en este tablero.</p>
                  <button onClick={() => setActiveView('backlog')} className="bg-emerald-500 text-neutral-950 px-5 md:px-6 py-2 md:py-2.5 rounded-lg text-sm md:text-base font-bold hover:bg-emerald-400 transition-colors">Ir al Backlog</button>
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEndBoard}>
                  <div className="px-4 md:px-6 py-3 md:py-4 shrink-0 bg-[#1d2125] border-b border-[#30363d] overflow-x-auto custom-scrollbar">
                    <div className="flex items-center justify-between gap-4 min-w-[300px]">
                      <div className="flex items-center gap-3 md:gap-4">
                        <SprintSelector viewedSprint={viewedSprint} sprints={sprints} setSelectedSprintId={setSelectedSprintId} />
                        {!isViewedSprintActive && <span className="bg-blue-500/20 text-blue-400 text-[10px] md:text-xs px-2 md:px-3 py-1 rounded-full font-bold uppercase tracking-widest border border-blue-500/30">Solo Lectura</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 mr-2">
                          {space.members.slice(0, 4).map((m: any, i: number) => (
                            <div key={i} className="w-7 h-7 md:w-8 md:h-8 rounded-full border-2 border-[#1d2125] bg-emerald-900 flex items-center justify-center text-[10px] md:text-xs font-bold text-white overflow-hidden shrink-0" title={m.user.name}>
                              {m.user.image ? <img src={m.user.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar"/> : m.user.name.charAt(0)}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-x-auto overflow-y-hidden px-4 md:px-6 pb-4 bg-[#1d2125] custom-scrollbar">
                    <div className="flex gap-4 h-full items-start mt-4">
                      {normalColumns.map((col: any) => {
                        const colTasks = viewedSprintTasks.filter((t: any) => t.columnId === col.id).sort((a:any, b:any) => a.order - b.order);
                        return (
                        <div key={col.id} className="w-[280px] md:w-[300px] shrink-0 bg-[#161a1d] rounded-xl flex flex-col max-h-full border border-[#30363d]">
                          <div className="p-3 flex justify-between items-center group"><h3 className="text-[11px] md:text-xs font-bold text-gray-400 uppercase">{col.title} <span className="ml-2 bg-[#2c333b] px-1.5 py-0.5 rounded-md text-gray-300">{colTasks.length}</span></h3></div>
                          <Droppable droppableId={col.id} type="TASK">
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.droppableProps} className={`p-2 flex-1 overflow-y-auto space-y-2 custom-scrollbar relative transition-colors ${snapshot.isDraggingOver && isViewedSprintActive ? 'bg-[#1a1e23]/80' : ''}`} style={{ minHeight: '100px' }}>
                                {colTasks.map((task: any, index: number) => <TaskCard key={task.id} task={task} colId={col.id} index={index} />)}
                                {provided.placeholder}
                                {addingTaskToCol === col.id && canEdit && isViewedSprintActive && (
                                  <div className="bg-[#22272b] p-2 rounded-lg border border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)] mt-2">
                                    <input autoFocus type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleCreateTask(col.id, activeSprint.id); if(e.key === 'Escape') setAddingTaskToCol(null); }} placeholder="¿Qué hay que hacer?" className="w-full bg-transparent text-sm text-white outline-none mb-2"/>
                                    <div className="flex justify-end gap-2"><button onClick={() => setAddingTaskToCol(null)} className="text-xs text-gray-400 hover:text-white px-2 py-1">Cancelar</button><button onClick={() => handleCreateTask(col.id, activeSprint.id)} className="text-xs bg-emerald-500 text-neutral-950 px-2 py-1 rounded font-bold">Guardar</button></div>
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                          {canEdit && isViewedSprintActive && addingTaskToCol !== col.id && <div className="p-2 border-t border-[#30363d]/50"><button onClick={() => setAddingTaskToCol(col.id)} className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-white hover:bg-[#2c333b] p-2 rounded-lg transition-colors"><Plus size={16} /> Añadir tarjeta</button></div>}
                        </div>
                      )})}
                      <div className="w-[280px] md:w-[300px] shrink-0 pr-4">
                        {isAddingColumn && canEdit && isViewedSprintActive ? (
                          <div className="bg-[#161a1d] border border-emerald-500 rounded-xl p-3 shadow-[0_0_15px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in-95 duration-200">
                            <input autoFocus type="text" value={newColumnTitle} onChange={(e) => setNewColumnTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleCreateColumn(); if (e.key === 'Escape') setIsAddingColumn(false); }} placeholder="Nombre de la columna..." className="w-full bg-transparent text-sm text-white outline-none mb-3 font-bold placeholder:font-normal" />
                            <div className="flex items-center gap-2"><button onClick={() => handleCreateColumn()} className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 px-3 py-1.5 rounded font-bold transition-colors">Guardar</button><button onClick={() => setIsAddingColumn(false)} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2c333b] rounded transition-colors"><X size={18} /></button></div>
                          </div>
                        ) : (
                          canEdit && isViewedSprintActive && <button onClick={() => setIsAddingColumn(true)} className="w-full flex items-center gap-2 text-sm text-gray-400 bg-[#161a1d]/30 hover:bg-[#161a1d] border border-dashed border-[#30363d] hover:border-emerald-500/50 hover:text-emerald-400 p-3 rounded-xl transition-all"><Plus size={16} /> Añadir columna</button>
                        )}
                      </div>
                    </div>
                  </div>
                </DragDropContext>
              )}
            </div>
          )}

          {activeView === 'lista' && (
            <TaskListView tasks={allTasks} columns={columns} sprints={sprints} epics={epics} onTaskClick={(task: any) => setEditingTask(task)} />
          )}

          {activeView === 'miembros' && (
            <div className="flex-1 overflow-y-auto p-4 md:p-10 relative z-10 animate-in fade-in duration-300">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Equipo del Proyecto</h2>
                <p className="text-gray-400 mb-6 md:mb-8 text-sm md:text-base">Gestiona o visualiza a los miembros de este Taskyspace.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                  {space.members.map((member: any) => (
                    <div key={member.id} className="bg-[#161a1d] border border-[#30363d] rounded-xl p-4 md:p-5 flex items-center justify-between hover:border-emerald-500/50 transition-all group shadow-lg">
                      <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-emerald-950 border border-[#30363d] flex items-center justify-center text-emerald-400 font-bold text-lg overflow-hidden shrink-0"><img src={member.user.image} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="avatar" /></div>
                        <div className="overflow-hidden">
                          <h4 className="text-white font-bold text-sm md:text-base truncate">{member.user.name}</h4>
                          <span className={`text-[10px] md:text-xs px-2 py-0.5 rounded font-medium mt-1 inline-block ${getRoleBadgeStyle(member.role)}`}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #30363d; border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4b5563; }
        `}} />
      </div>
    </>
  );
}