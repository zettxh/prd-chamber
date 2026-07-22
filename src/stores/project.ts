import { create } from 'zustand';

export type ProjectStatus = 'draft' | 'clarifying' | 'structured' | 'prd_ready';

export interface Project {
  id: string;
  title: string;
  date: string;
  status: ProjectStatus;
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  setActive: (id: string) => void;
  addProject: (p: Project) => void;
  updateProjectTitle: (id: string, title: string) => void;
  getProjectById: (id: string) => Project | undefined;
}

const dummyProjects: Project[] = [
  { id: 'dummy-1', title: 'Aplikasi POS Kopi', date: '2026-07-18', status: 'prd_ready' },
  { id: '2', title: 'Marketplace Freelance', date: '2026-07-15', status: 'structured' },
  { id: '3', title: 'Sistem Booking Barbershop', date: '2026-07-10', status: 'clarifying' },
  { id: '4', title: 'Platform Course Online', date: '2026-07-05', status: 'draft' },
];

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: dummyProjects,
  activeProjectId: null,

  setActive: (id) => set({ activeProjectId: id }),

  addProject: (p) => set((s) => ({ projects: [p, ...s.projects] })),

  updateProjectTitle: (id, title) =>
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, title } : p
      ),
    })),

  getProjectById: (id) => get().projects.find((p) => p.id === id),
}));
