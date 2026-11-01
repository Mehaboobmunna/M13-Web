import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { Project, Task, PulseBackupData } from '../../types/pulse';
import { useActivityMetrics, setMetricValue } from '../../utils/activityMetrics';
import {
  ArrowLeft,
  Play,
  Square,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Download,
  Upload,
  RefreshCw,
  Clock,
  X,
} from 'lucide-react';

const STORAGE_KEY_PROJECTS = 'pulse_projects_v1';
const STORAGE_KEY_TASKS = 'pulse_tasks_v1';
const STORAGE_KEY_ACTIVE = 'pulse_active_task_v1';

export const PulseApp: React.FC = () => {
  const { navigate } = useNavigation();

  // State
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'proj-1', name: 'General', createdAt: Date.now() },
      { id: 'proj-2', name: 'Development', createdAt: Date.now() },
    ];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'task-1',
        projectId: 'proj-1',
        name: 'Initial sprint planning',
        completed: false,
        intervals: [{ start: Date.now() - 3600000, end: Date.now() - 1800000, duration: 1800 }],
        createdAt: Date.now() - 3600000,
      },
    ];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>('proj-1');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ACTIVE);
    } catch {
      return null;
    }
  });

  const [activeTaskStartTime, setActiveTaskStartTime] = useState<number | null>(null);
  const [elapsedActiveSeconds, setElapsedActiveSeconds] = useState<number>(0);

  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newTaskName, setNewTaskName] = useState<string>('');
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);

  // Edit Duration Modal
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editHours, setEditHours] = useState<number>(0);
  const [editMinutes, setEditMinutes] = useState<number>(0);
  const [editSeconds, setEditSeconds] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const taskInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state to local storage and global metrics
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    setMetricValue('pulseTasksNoted', tasks.length);
  }, [tasks]);

  useEffect(() => {
    if (activeTaskId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE, activeTaskId);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE);
    }
  }, [activeTaskId]);

  // Timer loop
  useEffect(() => {
    if (!activeTaskId) {
      setElapsedActiveSeconds(0);
      setActiveTaskStartTime(null);
      return;
    }

    const start = activeTaskStartTime || Date.now();
    if (!activeTaskStartTime) {
      setActiveTaskStartTime(start);
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const currentRunSeconds = Math.floor((now - start) / 1000);
      setElapsedActiveSeconds(currentRunSeconds);
    }, 500);

    return () => clearInterval(interval);
  }, [activeTaskId, activeTaskStartTime]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleActiveTask();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        taskInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const activeTask = useMemo(() => {
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [tasks, activeTaskId]);

  const activeProject = useMemo(() => {
    if (activeTask) {
      return projects.find((p) => p.id === activeTask.projectId) || null;
    }
    return projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  }, [projects, activeTask, activeProjectId]);

  const formatSeconds = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return [hours, minutes, seconds].map((v) => String(v).padStart(2, '0')).join(':');
  };

  const getTaskTotalDuration = (task: Task, isCurrentlyRunning: boolean) => {
    const recorded = task.intervals.reduce((acc, curr) => acc + (curr.duration || 0), 0);
    return recorded + (isCurrentlyRunning ? elapsedActiveSeconds : 0);
  };

  const getProjectTotalDuration = (projectId: string) => {
    return tasks
      .filter((t) => t.projectId === projectId)
      .reduce((acc, t) => acc + getTaskTotalDuration(t, t.id === activeTaskId), 0);
  };

  // Actions
  const toggleActiveTask = () => {
    if (activeTaskId) {
      // Stop current task
      stopActiveTask();
    } else {
      // Find first uncompleted task in active project or create one
      const projectTasks = tasks.filter((t) => t.projectId === activeProjectId && !t.completed);
      if (projectTasks.length > 0) {
        startTask(projectTasks[0].id);
      }
    }
  };

  const startTask = (taskId: string) => {
    if (activeTaskId) {
      stopActiveTask();
    }
    setActiveTaskId(taskId);
    setActiveTaskStartTime(Date.now());
    setElapsedActiveSeconds(0);
  };

  const stopActiveTask = () => {
    if (!activeTaskId || !activeTaskStartTime) {
      setActiveTaskId(null);
      setElapsedActiveSeconds(0);
      return;
    }

    const duration = Math.max(1, Math.floor((Date.now() - activeTaskStartTime) / 1000));
    const now = Date.now();

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === activeTaskId) {
          return {
            ...t,
            intervals: [...t.intervals, { start: activeTaskStartTime, end: now, duration }],
          };
        }
        return t;
      })
    );

    setActiveTaskId(null);
    setActiveTaskStartTime(null);
    setElapsedActiveSeconds(0);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newProjectName.trim();
    if (!name) return;

    const newProj: Project = {
      id: 'proj-' + Date.now(),
      name,
      createdAt: Date.now(),
    };

    setProjects((prev) => [...prev, newProj]);
    setActiveProjectId(newProj.id);
    setNewProjectName('');
  };

  const handleDeleteProject = (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      alert('You must keep at least one project.');
      return;
    }

    if (activeTaskId && tasks.find((t) => t.id === activeTaskId)?.projectId === projId) {
      stopActiveTask();
    }

    setProjects((prev) => prev.filter((p) => p.id !== projId));
    setTasks((prev) => prev.filter((t) => t.projectId !== projId));
    if (activeProjectId === projId) {
      const remaining = projects.filter((p) => p.id !== projId);
      setActiveProjectId(remaining[0].id);
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newTaskName.trim();
    if (!name) return;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      projectId: activeProjectId,
      name,
      completed: false,
      intervals: [],
      createdAt: Date.now(),
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskName('');
    // Auto start created task
    startTask(newTask.id);
  };

  const toggleTaskCompleted = (taskId: string) => {
    if (activeTaskId === taskId) {
      stopActiveTask();
    }
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    if (activeTaskId === taskId) {
      stopActiveTask();
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Open Duration Modal
  const openEditModal = (task: Task) => {
    const isRunning = task.id === activeTaskId;
    if (isRunning) {
      stopActiveTask();
    }
    const totalSec = task.intervals.reduce((acc, curr) => acc + curr.duration, 0);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    setEditingTask(task);
    setEditHours(hrs);
    setEditMinutes(mins);
    setEditSeconds(secs);
  };

  const saveEditedDuration = () => {
    if (!editingTask) return;
    const totalSeconds = Math.max(0, editHours * 3600 + editMinutes * 60 + editSeconds);

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === editingTask.id) {
          // Flatten intervals into a single adjusted interval
          return {
            ...t,
            intervals:
              totalSeconds > 0
                ? [{ start: Date.now() - totalSeconds * 1000, end: Date.now(), duration: totalSeconds }]
                : [],
          };
        }
        return t;
      })
    );

    setEditingTask(null);
  };

  const quickSubtract = (sec: number) => {
    const current = Math.max(0, editHours * 3600 + editMinutes * 60 + editSeconds - sec);
    setEditHours(Math.floor(current / 3600));
    setEditMinutes(Math.floor((current % 3600) / 60));
    setEditSeconds(current % 60);
  };

  // CSV Export
  const exportCSV = () => {
    const rows = [
      ['Project', 'Task', 'Duration (HH:MM:SS)', 'Duration (Seconds)', 'Created Date'],
    ];

    tasks.forEach((t) => {
      const proj = projects.find((p) => p.id === t.projectId)?.name || 'Unknown';
      const dur = t.intervals.reduce((acc, c) => acc + c.duration, 0);
      rows.push([
        `"${proj.replace(/"/g, '""')}"`,
        `"${t.name.replace(/"/g, '""')}"`,
        formatSeconds(dur),
        String(dur),
        new Date(t.createdAt).toISOString().slice(0, 10),
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pulse_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Backup & Restore
  const backupJSON = () => {
    const data: PulseBackupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      projects,
      tasks,
      activeTaskId,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pulse_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.projects) && Array.isArray(parsed.tasks)) {
          setProjects(parsed.projects);
          setTasks(parsed.tasks);
          setActiveTaskId(null);
          setActiveTaskStartTime(null);
          setElapsedActiveSeconds(0);
          if (parsed.projects.length > 0) {
            setActiveProjectId(parsed.projects[0].id);
          }
        }
      } catch {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetToZero = () => {
    if (confirm('Are you sure you want to reset all tasks and project intervals to zero?')) {
      stopActiveTask();
      setTasks([]);
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (t.projectId !== activeProjectId) return false;
      if (hideCompleted && t.completed) return false;
      return true;
    });
  }, [tasks, activeProjectId, hideCompleted]);

  const currentHeroDisplaySeconds = useMemo(() => {
    if (activeTask) {
      return getTaskTotalDuration(activeTask, true);
    }
    return 0;
  }, [activeTask, elapsedActiveSeconds]);

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col gap-6">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-black text-sky-400 tracking-tight flex items-center gap-2">
            <span>⏱️ Pulse</span>
          </h1>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>
              <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-sky-400">
                Space
              </kbd>{' '}
              Start/Stop
            </span>
            <span>
              <kbd className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-sky-400">
                N
              </kbd>{' '}
              New Task
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <span>📋 Tasks Noted: <strong className="text-white font-mono">{tasks.length}</strong></span>
          </div>

          <button
            onClick={exportCSV}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button
            onClick={backupJSON}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            Backup
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" /> Restore
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleRestoreFile}
          />
          <button
            onClick={resetToZero}
            className="px-2.5 py-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-medium rounded-lg border border-rose-800/50 flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </header>

      {/* Top Running Hero Banner */}
      <div
        className={`bg-slate-800/90 border rounded-2xl p-4 sm:p-5 flex items-center justify-between transition-all duration-300 ${
          activeTaskId
            ? 'border-sky-400 shadow-lg shadow-sky-500/10'
            : 'border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <span
            className={`w-3 h-3 rounded-full shrink-0 ${
              activeTaskId
                ? 'bg-emerald-400 animate-pulse shadow-xs shadow-emerald-400/80'
                : 'bg-slate-600'
            }`}
          />
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {activeTask ? activeProject?.name || 'Active Project' : 'No active task'}
            </div>
            <div className="text-base sm:text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
              {activeTask ? activeTask.name : 'Idle'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => activeTask && openEditModal(activeTask)}
            className="font-mono text-xl sm:text-2xl font-bold text-sky-400 hover:underline px-2 py-1 rounded bg-slate-900/60 border border-slate-800 cursor-pointer"
            title="Click to adjust duration"
          >
            {formatSeconds(currentHeroDisplaySeconds)}
          </button>
          <button
            onClick={toggleActiveTask}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition ${
              activeTaskId
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
            }`}
          >
            {activeTaskId ? (
              <>
                <Square className="w-4 h-4 fill-current" /> Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" /> Start
              </>
            )}
          </button>
        </div>
      </div>

      {/* App Workspace Two-Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Projects Column (1 col) */}
        <aside className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-3 shadow-lg">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-700/60">
            <span>Projects</span>
            <span className="font-mono text-sky-400">{projects.length}</span>
          </div>

          <form onSubmit={handleAddProject} className="flex gap-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="p-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-1">
            {projects.map((proj) => {
              const isActive = proj.id === activeProjectId;
              const totalSec = getProjectTotalDuration(proj.id);
              const taskCount = tasks.filter((t) => t.projectId === proj.id).length;

              return (
                <div
                  key={proj.id}
                  onClick={() => setActiveProjectId(proj.id)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                    isActive
                      ? 'bg-sky-950/60 border-sky-500/50 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-xs truncate">{proj.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{taskCount} tasks</span>
                      <span>&bull;</span>
                      <span className="text-sky-400">{formatSeconds(totalSec)}</span>
                    </div>
                  </div>
                  {projects.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteProject(proj.id, e)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition ml-2"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Tasks Column (2 cols) */}
        <main className="md:col-span-2 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="text-sky-400">{activeProject?.name}</span>
                <span className="text-xs text-slate-400 font-normal">Tasks</span>
              </h2>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hideCompleted}
                onChange={(e) => setHideCompleted(e.target.checked)}
                className="rounded bg-slate-900 border-slate-700 text-sky-500 focus:ring-0"
              />
              <span>Hide completed</span>
            </label>
          </div>

          <form onSubmit={handleAddTask} className="flex gap-2">
            <input
              ref={taskInputRef}
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Type task & press Enter to auto-start..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" /> Task
            </button>
          </form>

          {/* Task List */}
          <div className="flex flex-col gap-2 min-h-48">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const isRunning = task.id === activeTaskId;
                const durationSec = getTaskTotalDuration(task, isRunning);

                return (
                  <div
                    key={task.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                      isRunning
                        ? 'bg-sky-950/70 border-sky-500/80 shadow-md shadow-sky-500/10'
                        : task.completed
                        ? 'bg-slate-900/30 border-slate-800/80 opacity-60'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className="text-slate-400 hover:text-sky-400 transition cursor-pointer shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                      <span
                        className={`text-xs sm:text-sm font-medium truncate ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openEditModal(task)}
                        className="font-mono text-xs sm:text-sm font-bold text-sky-400 px-2 py-1 rounded bg-slate-950/80 border border-slate-800 hover:border-sky-500/50 cursor-pointer"
                        title="Click to adjust logged duration"
                      >
                        {formatSeconds(durationSec)}
                      </button>

                      <button
                        onClick={() => (isRunning ? stopActiveTask() : startTask(task.id))}
                        className={`p-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                          isRunning
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                        title={isRunning ? 'Pause' : 'Start'}
                      >
                        {isRunning ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>

                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                <Clock className="w-8 h-8 text-slate-600 mb-2" />
                <p>No tasks yet in {activeProject?.name}. Type above and press Enter!</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Duration Adjustment Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Adjust Duration</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{editingTask.name}</p>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                Quick Deductions:
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => quickSubtract(300)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  -5m
                </button>
                <button
                  type="button"
                  onClick={() => quickSubtract(900)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  -15m
                </button>
                <button
                  type="button"
                  onClick={() => quickSubtract(1800)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  -30m
                </button>
                <button
                  type="button"
                  onClick={() => quickSubtract(3600)}
                  className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                >
                  -1h
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Hours
                </label>
                <input
                  type="number"
                  min="0"
                  value={editHours}
                  onChange={(e) => setEditHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-sm font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Minutes
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-sm font-mono text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Seconds
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={editSeconds}
                  onChange={(e) => setEditSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-center text-sm font-mono text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEditedDuration}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
