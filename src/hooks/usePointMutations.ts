"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createPoint,
  updatePoint,
  deletePoint,
  addNeed,
  updateNeed,
  deleteNeed,
} from "@/lib/actions/points";

export function useCreatePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPoint,
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Ponto criado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: () => {
      toast.error("Erro ao criar ponto. Tente novamente.");
    },
  });
}

export function useUpdatePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pointId, data }: { pointId: string; data: Parameters<typeof updatePoint>[1] }) =>
      updatePoint(pointId, data),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Ponto atualizado!");
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar ponto. Tente novamente.");
    },
  });
}

export function useDeletePoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePoint,
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Ponto removido com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
      queryClient.invalidateQueries({ queryKey: ["cities"] });
    },
    onError: () => {
      toast.error("Erro ao remover ponto. Tente novamente.");
    },
  });
}

export function useAddNeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pointId, need }: { pointId: string; need: Parameters<typeof addNeed>[1] }) =>
      addNeed(pointId, need),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
    },
    onError: () => {
      toast.error("Erro ao adicionar necessidade. Tente novamente.");
    },
  });
}

export function useUpdateNeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ needId, data }: { needId: string; data: Parameters<typeof updateNeed>[1] }) =>
      updateNeed(needId, data),
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
    },
    onError: () => {
      toast.error("Erro ao atualizar necessidade. Tente novamente.");
    },
  });
}

export function useDeleteNeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNeed,
    onSuccess: (result) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
    },
    onError: () => {
      toast.error("Erro ao remover necessidade. Tente novamente.");
    },
  });
}
