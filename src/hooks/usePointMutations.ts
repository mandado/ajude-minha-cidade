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
import type { MapPoint } from "@/types/map";
import type { Need, PointType } from "@/types/database";

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
    onSuccess: (result, { pointId, data }) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Ponto atualizado!");
      // Atualiza o cache imediatamente para refletir as mudanças sem esperar o refetch
      queryClient.setQueryData<MapPoint[]>(["map-points"], (old) =>
        old?.map((point) => {
          if (point.id !== pointId) return point;
          return {
            ...point,
            ...(data.name !== undefined && { name: data.name }),
            ...(data.description !== undefined && { description: data.description }),
            ...(data.type !== undefined && { type: data.type as PointType }),
            ...(data.latitude !== undefined && { latitude: data.latitude }),
            ...(data.longitude !== undefined && { longitude: data.longitude }),
            ...(data.address !== undefined && { address: data.address }),
            ...(data.city !== undefined && { city: data.city }),
            ...(data.state !== undefined && { state: data.state }),
            ...(data.neighborhood !== undefined && { neighborhood: data.neighborhood }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.operating_hours !== undefined && { operating_hours: data.operating_hours }),
          };
        })
      );
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
    onSuccess: (result, pointId) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Ponto removido com sucesso!");
      // Remove o ponto do cache imediatamente
      queryClient.setQueryData<MapPoint[]>(["map-points"], (old) =>
        old?.filter((point) => point.id !== pointId)
      );
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
    onSuccess: (result, { pointId }) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // Adiciona a nova necessidade ao cache imediatamente usando o objeto retornado pelo servidor
      if ("need" in result && result.need) {
        const newNeed = result.need as Need;
        queryClient.setQueryData<MapPoint[]>(["map-points"], (old) =>
          old?.map((point) =>
            point.id === pointId
              ? { ...point, needs: [...point.needs, newNeed] }
              : point
          )
        );
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
    onSuccess: (result, { needId }) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // Atualiza a necessidade no cache imediatamente usando o objeto retornado pelo servidor
      if ("need" in result && result.need) {
        const updatedNeed = result.need as Need;
        queryClient.setQueryData<MapPoint[]>(["map-points"], (old) =>
          old?.map((point) => ({
            ...point,
            needs: point.needs.map((need) =>
              need.id === needId ? { ...need, ...updatedNeed } : need
            ),
          }))
        );
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
    onSuccess: (result, needId) => {
      if (result.error) {
        toast.error(result.error);
        return;
      }
      // Remove a necessidade do cache imediatamente
      queryClient.setQueryData<MapPoint[]>(["map-points"], (old) =>
        old?.map((point) => ({
          ...point,
          needs: point.needs.filter((need) => need.id !== needId),
        }))
      );
      queryClient.invalidateQueries({ queryKey: ["map-points"] });
    },
    onError: () => {
      toast.error("Erro ao remover necessidade. Tente novamente.");
    },
  });
}
