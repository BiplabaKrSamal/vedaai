import type { Assignment, AssignmentInput, GeneratedPaper } from '@vedaai/shared';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json.data as T;
}

export const api = {
  getAssignments: () => request<Assignment[]>('/api/assignments'),

  getAssignment: (id: string) => request<Assignment>(`/api/assignments/${id}`),

  createAssignment: async (input: AssignmentInput, file?: File): Promise<Assignment> => {
    if (file) {
      // Multipart form data when file is included
      const form = new FormData();
      form.append('data', JSON.stringify(input));
      form.append('material', file);
      const res = await fetch(`${BASE}/api/assignments`, {
        method: 'POST',
        body: form,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to create');
      return json.data as Assignment;
    }
    return request<Assignment>('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  deleteAssignment: (id: string) =>
    request<void>(`/api/assignments/${id}`, { method: 'DELETE' }),

  regenerateAssignment: (id: string) =>
    request<{ jobId: string }>(`/api/assignments/${id}/regenerate`, {
      method: 'POST',
    }),
};
