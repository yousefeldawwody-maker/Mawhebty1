const noopMutation = () => ({ mutate: (_input?: unknown) => undefined, isPending: false });
const noopQuery = (): { data: { questions?: unknown[]; talents?: unknown[] } | undefined; isLoading: boolean; error: null } => ({ data: undefined, isLoading: false, error: null });

export const trpc = {
  catalog: { snapshot: { useQuery: noopQuery } },
  assessment: { save: { useMutation: noopMutation } },
  progress: { completeLesson: { useMutation: noopMutation } },
};
