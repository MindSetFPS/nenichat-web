import { create } from 'zustand';
import { ITemplate } from '@/Nenichat/Templates/domain/ITemplate';

interface TemplateState {
  templates: ITemplate[];
  isLoading: boolean;
  error: string | null;

  fetchTemplates: () => Promise<void>;
  createTemplate: (name: string, message: string) => Promise<void>;
  updateTemplate: (id: string, name: string, message: string) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplateStore = create<TemplateState>((set, get) => ({
  templates: [],
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      const templates = await response.json();
      set({ templates, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTemplate: async (name: string, message: string) => {
    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to create template');
    }

    const template = await response.json();
    set((state) => ({ templates: [template, ...state.templates] }));
  },

  updateTemplate: async (id: string, name: string, message: string) => {
    const response = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to update template');
    }

    const updated = await response.json();
    set((state) => ({
      templates: state.templates.map((t) => (t.id === id ? updated : t)),
    }));
  },

  deleteTemplate: async (id: string) => {
    const response = await fetch(`/api/templates/${id}`, { method: 'DELETE' });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to delete template');
    }

    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
    }));
  },
}));
