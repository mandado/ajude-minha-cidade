"use client";

import { useState } from "react";
import { Construction, MapPin, Loader2, Hash } from "lucide-react";
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
  proximity?: { lat: number; lng: number };
}

export function AddBlockedStreetDialog({
  open,
  onOpenChange,
  onCreated,
  proximity,
}: AddBlockedStreetDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<GeoSearchResult | null>(null);
  const [fromNumber, setFromNumber] = useState("");
  const [toNumber, setToNumber] = useState("");
  const [error, setError] = useState("");

  const mutation = useCreateBlockedStreet();

  const handleClose = (value: boolean) => {
    if (!value) {
      setName("");
      setDescription("");
      setLocation(null);
      setFromNumber("");
      setToNumber("");
      setError("");
    }
    onOpenChange(value);
  };

  const handleGeoSelect = (result: GeoSearchResult) => {
    setLocation(result);
    setError("");
    if (!name.trim()) {
      setName(result.street || result.displayName.split(",")[0]?.trim() || "");
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
    if ((fromNumber.trim() && !toNumber.trim()) || (!fromNumber.trim() && toNumber.trim())) {
      setError("Informe o número inicial e final do trecho, ou deixe ambos em branco.");
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
      fromNumber: fromNumber.trim() || undefined,
      toNumber: toNumber.trim() || undefined,
    });

    if ("error" in result) {
      setError(result.error);
      return;
    }

    handleClose(false);
    onCreated?.();
  };

  const hasRange = fromNumber.trim() || toNumber.trim();

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
                <DrawerTitle>Reportar Rua Fechada</DrawerTitle>
                <DrawerDescription>
                  Informe uma via interditada para alertar outras pessoas.
                </DrawerDescription>
              </div>
            </div>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-8">
            <div className="space-y-2">
              <Label>
                Localização da rua <span className="text-destructive">*</span>
              </Label>
              <GeoSearch
                placeholder="Buscar rua, bairro ou ponto de referência..."
                onSelect={handleGeoSelect}
                proximity={proximity}
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

            {/* Trecho por número */}
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
              {hasRange && (
                <p className="text-xs text-muted-foreground">
                  Apenas o trecho entre os números {fromNumber} e {toNumber} será marcado no mapa.
                </p>
              )}
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
