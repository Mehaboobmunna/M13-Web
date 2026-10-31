export interface TaskInterval {
  start: number;
  end: number;
  duration: number; // in seconds
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  completed: boolean;
  intervals: TaskInterval[];
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  createdAt: number;
}

export interface PulseBackupData {
  version: string;
  exportedAt: string;
  projects: Project[];
  tasks: Task[];
  activeTaskId: string | null;
}
