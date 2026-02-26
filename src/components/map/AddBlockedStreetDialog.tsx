"use client";

import { useState } from "react";
import { Construction, MapPin, Loader2 } from "lucide-react";
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
import { GeoSearch, type GeoSearchResult } from "./GeoSearch";
import { useCreateBlockedStreet } from "@/hooks/useBlockedStreets";

interface AddBlockedStreetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

export function AddBlockedStreetDialog({
  open,
  onOpenChange,
  onCreated,
}: AddBlockedStreetDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<GeoSearchResult | null>(null);
  const [error, setError] = useState("");

  const mutation = useCreateBlockedStreet();

  const handleClose = (value: boolean) => {
    if (!value) {
      setName("");
      setDescription("");
      setLocation(null);
      setError("");
    }
    onOpenChange(value);
  };

  const handleGeoSelect = (result: GeoSearchResult) => {
    setLocation(result);
    setError("");
    // Auto-fill name from the result if empty
    if (!name.trim()) {
      const parts = result.displayName.split(",");
      setName(parts[0]?.trim() ?? "");
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Informe o nome da rua.");
      return;
    }
    if (!location) {
      setError("Selecione a localização da rua no campo de busca.");
      return;
    }

    const result = await mutation.mutateAsync({
      name: name.trim(),
      neighborhood: location.neighborhood ?? "",
      city: location.city ?? "",
      state: location.state ?? "",
      description: description.trim(),
      lat: location.latitude,
      lng: location.longitude,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    handleClose(false);
    onCreated?.();
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
                <DrawerTitle>Registrar Rua Bloqueada</DrawerTitle>
                <DrawerDescription>
                  Informe uma via interditada para alertar outras pessoas.
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-8">
            {/* Localização primeiro — auto-preenche o nome */}
            <div className="space-y-2">
              <Label>
                Localização da rua <span className="text-destructive">*</span>
              </Label>
              <GeoSearch
                placeholder="Buscar rua, bairro ou ponto de referência..."
                onSelect={handleGeoSelect}
              />
              {location && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="size-3 shrink-0" />
                  {location.city}
                  {location.state && `/${location.state}`}
                  {location.neighborhood && ` — ${location.neighborhood}`}
                </p>
              )}
            </div>

            {/* Nome da rua */}
            <div className="space-y-2">
              <Label>
                Nome da rua <span className="text-destructive">*</span>
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Rua das Flores, Av. Brasil, BR-040..."
              />
            </div>

            {/* Motivo */}
            <div className="space-y-2">
              <Label>Motivo do bloqueio</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Alagamento, deslizamento, acidente..."
                rows={2}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
              Ao salvar, tentaremos traçar automaticamente o trecho da rua no
              mapa. Se não for possível, aparecerá um marcador no ponto
              indicado.
            </div>

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
                  <>
                    <Construction className="size-4 mr-2" />
                    Registrar bloqueio
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
