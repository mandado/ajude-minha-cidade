"use client";

import { useState } from "react";
import { CheckCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReportPoint, useConfirmPoint } from "@/hooks/useModeration";
import { useAuth } from "@/hooks/useAuth";
import type { MapPoint } from "@/types/map";

interface ModerationButtonsProps {
  point: MapPoint;
}

export function ModerationButtons({ point }: ModerationButtonsProps) {
  const { user } = useAuth();
  const [showReportInput, setShowReportInput] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [reported, setReported] = useState(false);

  const confirmMutation = useConfirmPoint();
  const reportMutation = useReportPoint();

  if (!user) return null;

  const handleConfirm = () => {
    confirmMutation.mutate(point.id, {
      onSuccess: () => setConfirmed(true),
    });
  };

  const handleReport = () => {
    if (!reportReason.trim()) return;
    reportMutation.mutate(
      { pointId: point.id, reason: reportReason.trim() },
      {
        onSuccess: (result) => {
          if (!result.error) {
            setShowReportInput(false);
            setReportReason("");
            setReported(true);
          }
        },
      },
    );
  };

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground">
        Ajude a comunidade
      </p>

      {confirmed ? (
        <p className="text-sm text-green-700 font-medium flex items-center gap-1.5">
          <CheckCircle className="size-4" />
          Obrigado por confirmar!
        </p>
      ) : reported ? (
        <p className="text-sm text-orange-700 font-medium flex items-center gap-1.5">
          <Flag className="size-4" />
          Denúncia enviada. Obrigado!
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-green-700 hover:text-green-800 hover:bg-green-50"
              onClick={handleConfirm}
              disabled={confirmMutation.isPending}
            >
              <CheckCircle className="size-4 mr-1.5" />
              Confirmo que existe
              {point.confirmations_count > 0 && (
                <span className="ml-1 text-xs text-muted-foreground">
                  ({point.confirmations_count})
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              onClick={() => setShowReportInput(!showReportInput)}
              disabled={reportMutation.isPending}
            >
              <Flag className="size-4 mr-1.5" />
              Denunciar
            </Button>
          </div>

          {showReportInput && (
            <div className="space-y-2">
              <Input
                placeholder='Ex: "Endereço errado", "Local fechado", "Não existe"'
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleReport();
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                  onClick={handleReport}
                  disabled={reportMutation.isPending || reportReason.trim().length < 3}
                >
                  {reportMutation.isPending ? "Enviando..." : "Enviar denúncia"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowReportInput(false); setReportReason(""); }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
