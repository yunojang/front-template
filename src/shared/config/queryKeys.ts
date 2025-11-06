export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  editor: {
    state: (id: string) => ['editor', id] as const,
  },
}
