import { createActor } from "@/backend";
import type { EmergencyMessageView as BackendEmergencyMessageView } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { EmergencyMessageView, Urgency } from "../types";

/** Augment backend messages with optional new fields, defaulting missing ones */
function augmentMessage(m: BackendEmergencyMessageView): EmergencyMessageView {
  const ext = m as BackendEmergencyMessageView & {
    acknowledged?: boolean;
    acknowledgedAt?: bigint | null;
    response?: string | null;
    respondedAt?: bigint | null;
    dispatched?: boolean;
    dispatchedAt?: bigint | null;
  };
  return {
    ...m,
    acknowledged: ext.acknowledged ?? false,
    acknowledgedAt: ext.acknowledgedAt ?? null,
    response: ext.response ?? null,
    respondedAt: ext.respondedAt ?? null,
    dispatched: ext.dispatched ?? false,
    dispatchedAt: ext.dispatchedAt ?? null,
  };
}

type ActorWithExtensions = {
  acknowledgeEmergencyMessage?: (id: bigint) => Promise<boolean>;
  respondToEmergencyMessage?: (
    id: bigint,
    response: string,
  ) => Promise<boolean>;
  dispatchEmergencyMessage?: (id: bigint) => Promise<boolean>;
};

export function useEmergencyMessages() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<EmergencyMessageView[]>({
    queryKey: ["emergencyMessages"],
    queryFn: async () => {
      if (!actor) return [];
      const msgs = await actor.listEmergencyMessages();
      return msgs.map(augmentMessage);
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useUnresolvedEmergencyCount() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: ["unresolvedEmergencyCount"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.unresolvedEmergencyCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3000,
  });
}

export function useSubmitEmergencyMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<
    bigint,
    Error,
    { message: string; urgency: Urgency; location: string }
  >({
    mutationFn: async ({ message, urgency, location }) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.submitEmergencyMessage(message, urgency, location);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyMessages"] });
      queryClient.invalidateQueries({ queryKey: ["unresolvedEmergencyCount"] });
    },
  });
}

export function useResolveEmergencyMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      return actor.resolveEmergencyMessage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyMessages"] });
      queryClient.invalidateQueries({ queryKey: ["unresolvedEmergencyCount"] });
    },
  });
}

export function useAcknowledgeEmergencyMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      const ext = actor as unknown as ActorWithExtensions;
      if (!ext.acknowledgeEmergencyMessage)
        throw new Error("Method not available");
      return ext.acknowledgeEmergencyMessage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyMessages"] });
    },
  });
}

export function useRespondToEmergencyMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, { id: bigint; response: string }>({
    mutationFn: async ({ id, response }) => {
      if (!actor) throw new Error("Actor not ready");
      const ext = actor as unknown as ActorWithExtensions;
      if (!ext.respondToEmergencyMessage)
        throw new Error("Method not available");
      return ext.respondToEmergencyMessage(id, response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyMessages"] });
    },
  });
}

export function useDispatchEmergencyMessage() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not ready");
      const ext = actor as unknown as ActorWithExtensions;
      if (!ext.dispatchEmergencyMessage)
        throw new Error("Method not available");
      return ext.dispatchEmergencyMessage(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyMessages"] });
    },
  });
}
