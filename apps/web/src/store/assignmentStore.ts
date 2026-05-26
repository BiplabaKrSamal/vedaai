import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Assignment, AssignmentInput, AssignmentStatus, GeneratedPaper } from '@vedaai/shared';
import { api } from '@/lib/api';

interface AssignmentState {
  // Data
  assignments: Assignment[];
  activeAssignmentId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  // UI state
  showCreateModal: boolean;
  showUploadModal: boolean;

  // Actions
  fetchAssignments: () => Promise<void>;
  createAssignment: (input: AssignmentInput, file?: File) => Promise<Assignment>;
  deleteAssignment: (id: string) => Promise<void>;
  regenerateAssignment: (id: string) => Promise<void>;
  setActiveAssignment: (id: string | null) => void;
  updateAssignmentStatus: (id: string, status: AssignmentStatus, paper?: GeneratedPaper) => void;
  setShowCreateModal: (show: boolean) => void;
  setShowUploadModal: (show: boolean) => void;
  clearError: () => void;
}

export const useAssignmentStore = create<AssignmentState>()(
  devtools(
    (set, get) => ({
      assignments: [],
      activeAssignmentId: null,
      isLoading: false,
      isCreating: false,
      error: null,
      showCreateModal: false,
      showUploadModal: false,

      fetchAssignments: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.getAssignments();
          set({ assignments: data, isLoading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to fetch',
            isLoading: false,
          });
        }
      },

      createAssignment: async (input: AssignmentInput, file?: File) => {
        set({ isCreating: true, error: null });
        try {
          const assignment = await api.createAssignment(input, file);
          set((state) => ({
            assignments: [assignment, ...state.assignments],
            isCreating: false,
            showCreateModal: false,
            activeAssignmentId: assignment._id,
          }));
          return assignment;
        } catch (err) {
          set({
            error: err instanceof Error ? err.message : 'Failed to create',
            isCreating: false,
          });
          throw err;
        }
      },

      deleteAssignment: async (id: string) => {
        try {
          await api.deleteAssignment(id);
          set((state) => ({
            assignments: state.assignments.filter((a) => a._id !== id),
            activeAssignmentId:
              state.activeAssignmentId === id ? null : state.activeAssignmentId,
          }));
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to delete' });
        }
      },

      regenerateAssignment: async (id: string) => {
        try {
          await api.regenerateAssignment(id);
          get().updateAssignmentStatus(id, 'pending');
        } catch (err) {
          set({ error: err instanceof Error ? err.message : 'Failed to regenerate' });
        }
      },

      setActiveAssignment: (id: string | null) => {
        set({ activeAssignmentId: id });
      },

      updateAssignmentStatus: (id, status, paper) => {
        set((state) => ({
          assignments: state.assignments.map((a) =>
            a._id === id ? { ...a, status, ...(paper ? { paper } : {}) } : a
          ),
        }));
      },

      setShowCreateModal: (show: boolean) => set({ showCreateModal: show }),
      setShowUploadModal: (show: boolean) => set({ showUploadModal: show }),
      clearError: () => set({ error: null }),
    }),
    { name: 'vedaai-assignments' }
  )
);
