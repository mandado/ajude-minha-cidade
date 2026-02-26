import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBlockedStreets,
  createBlockedStreet,
  deleteBlockedStreet,
} from "@/lib/actions/blocked-streets";

export function useBlockedStreets() {
  return useQuery({
    queryKey: ["blocked-streets"],
    queryFn: getBlockedStreets,
    staleTime: 30_000,
  });
}

export function useCreateBlockedStreet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBlockedStreet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-streets"] });
    },
  });
}

export function useDeleteBlockedStreet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBlockedStreet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blocked-streets"] });
    },
  });
}
