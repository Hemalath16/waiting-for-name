import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SignalStatus, TrafficSignalView } from "../types";

export function useSignals() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TrafficSignalView[]>({
    queryKey: ["signals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSignals();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useSignal(id: bigint) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<TrafficSignalView | null>({
    queryKey: ["signal", id.toString()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSignal(id);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useUpdateSignalStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, { id: bigint; status: SignalStatus }>({
    mutationFn: async ({ id, status }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.updateSignalStatus(id, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });
}
