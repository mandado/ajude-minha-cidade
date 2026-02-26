"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { reportPoint, confirmPoint } from "@/lib/actions/moderation";

export function useReportPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pointId, reason }: { pointId: string; reason: string }) =>
      reportPoint(pointId, reason),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Denúncia registrada. Obrigado por ajudar!");
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
    },
    onError: () => {
      toast.error("Erro ao registrar denúncia. Tente novamente.");
    },
  });
}

export function useConfirmPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pointId: string) => confirmPoint(pointId),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Confirmação registrada. Obrigado!");
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
    },
    onError: () => {
      toast.error("Erro ao confirmar ponto. Tente novamente.");
    },
  });
}
