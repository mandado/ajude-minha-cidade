"use client";

import { useState, useEffect } from "react";
import { Construction, Loader2, Hash } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateBlockedStreet } from "@/hooks/useBlockedStreets";

interface EditBlockedStreetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  street: {
    id: string;
    name: string;
    description: string;
    fromNumber?: string | null;
    toNumber?: string | null;
  } | null;
  onUpdated?: () => void;
}

export function EditBlockedStreetDialog({
  open,
  onOpenChange,
  street,
  onUpdated,
}: EditBlockedStreetDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [toNumber, setToNumber] = useState("");
  const [error, setError] = useState("");

  const mutation = useUpdateBlockedStreet();

  // Preenche o formulário quando o street muda
  useEffect(() => {
    if (street) {
      setName(street.name);
      setDescription(street.description);
      setFromNumber(street.fromNumber ?? "");
      setToNumber(street.toNumber ?? "");
      setError("");
    }
  }, [street]);

  const handleClose = (value: boolean) => {
    if (!value) setError("");
    onOpenChange(value);
  };

  const handleSubmit = async () => {
    if (!street) return;

    if (!name.trim()) {
      setError("Nome da rua é obrigatório.");
      return;
    }
    if ((fromNumber.trim() && !toNumber.trim()) || (!fromNumber.trim() && toNumber.trim())) {
      setError("Informe o número inicial e final, ou deixe ambos em branco.");
      return;
    }

    const result = await mutation.mutateAsync({
      id: street.id,
      name: name.trim(),
      description: description.trim(),
      fromNumber: fromNumber.trim() || undefined,
      toNumber: toNumber.trim() || undefined,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    handleClose(false);
    onUpdated?.();
  };

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent>
        <div className="overflow-y-auto flex-1">
          <DrawerHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center size-9 rounded-lg bg-red-50 shrink-0">
                <Construction className="size-5 text-red-600" />
              </span>
              <div>
                <DrawerTitle>Editar Rua Fechada</DrawerTitle>
                <DrawerDescription>
                  Atualize as informações desta via interditada.
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-8">
            <div className="space-y-2">
              <Label>
                Nome da rua <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Rua das Flores, Av. Brasil..."
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Hash className="size-3.5 text-muted-foreground" />
                Trecho bloqueado
                <span className="text-xs font-normal text-muted-foreground">(opcional)</span>
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Input
                    value={fromNumber}
                    onChange={(e) => setFromNumber(e.target.value)}
                    placeholder="Do nº"
                    type="text"
                    inputMode="numeric"
                  />
                </div>
                <span className="text-sm text-muted-foreground shrink-0">até</span>
                <div className="flex-1">
                  <Input
                    value={toNumber}
                    onChange={(e) => setToNumber(e.target.value)}
                    placeholder="Ao nº"
                    type="text"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Motivo do bloqueio</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Alagamento, deslizamento, acidente..."
                rows={2}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => handleClose(false)}
                disabled={mutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={handleSubmit}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar alterações"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
