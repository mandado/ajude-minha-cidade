"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GeoSearch, type GeoSearchResult } from "./GeoSearch";
import { useCreatePoint } from "@/hooks/usePointMutations";
import { Plus, Trash2 } from "lucide-react";
import type { NeedInput } from "@/lib/validators/point";

interface CreatePointDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPointCreated?: (lat: number, lng: number) => void;
}

export function CreatePointDialog({
  open,
  onOpenChange,
  onPointCreated,
}: CreatePointDialogProps) {
  const createPointMutation = useCreatePoint();

  // Needs managed separately (array sub-form)
  const [needs, setNeeds] = useState<NeedInput[]>([]);
  const [newNeedDesc, setNewNeedDesc] = useState("");
  const [newNeedQty, setNewNeedQty] = useState("");
  const [newNeedUnit, setNewNeedUnit] = useState("");

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      type: "shelter",
      priority: "medium",
      latitude: null as number | null,
      longitude: null as number | null,
      address: "",
      city: "",
      state: "",
      neighborhood: "",
      phone: "",
      operatingHours: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.latitude || !value.longitude) {
        toast.error("Selecione uma localização usando a busca de endereço.");
        return;
      }

      const result = await createPointMutation.mutateAsync({
        point: {
          name: value.name,
          description: value.description || undefined,
          type: value.type,
          priority: value.priority,
          latitude: value.latitude,
          longitude: value.longitude,
          address: value.address || undefined,
          city: value.city || undefined,
          state: value.state || undefined,
          neighborhood: value.neighborhood || undefined,
          phone: value.phone || undefined,
          operating_hours: value.operatingHours || undefined,
        },
        needs,
      });

      if (result.success) {
        form.reset();
        setNeeds([]);
        setNewNeedDesc("");
        setNewNeedQty("");
        setNewNeedUnit("");
        onOpenChange(false);
      }
    },
  });

  const handleGeoSelect = (result: GeoSearchResult) => {
    form.setFieldValue("latitude", result.latitude);
    form.setFieldValue("longitude", result.longitude);
    form.setFieldValue("address", result.displayName);
    form.setFieldValue("city", result.city);
    form.setFieldValue("state", result.state);
    form.setFieldValue("neighborhood", result.neighborhood);
    onPointCreated?.(result.latitude, result.longitude);
  };

  const addNeed = () => {
    if (!newNeedDesc.trim()) return;
    setNeeds((prev) => [
      ...prev,
      {
        description: newNeedDesc.trim(),
        quantity: newNeedQty ? Number(newNeedQty) : undefined,
        unit: newNeedUnit || undefined,
      },
    ]);
    setNewNeedDesc("");
    setNewNeedQty("");
    setNewNeedUnit("");
  };

  const removeNeed = (index: number) => {
    setNeeds((prev) => prev.filter((_, i) => i !== index));
  };

  const resetAll = () => {
    form.reset();
    setNeeds([]);
    setNewNeedDesc("");
    setNewNeedQty("");
    setNewNeedUnit("");
  };

  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) resetAll();
        onOpenChange(value);
      }}
    >
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-2 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/30" />
        </div>
        <SheetHeader>
          <SheetTitle>Cadastrar Ponto</SheetTitle>
        </SheetHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4 px-4 pb-4"
        >
          <form.Field
            name="name"
            validators={{
              onSubmit: ({ value }) =>
                value.trim().length < 3 ? "Nome deve ter pelo menos 3 caracteres" : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="point-name">Nome *</Label>
                <Input
                  id="point-name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  placeholder="Nome do ponto"
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="point-description">Descrição</Label>
                <Textarea
                  id="point-description"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Descrição do ponto"
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="type">
              {(field) => (
                <div className="space-y-2">
                  <Label>Tipo *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shelter">Abrigo</SelectItem>
                      <SelectItem value="collection">Ponto de Coleta</SelectItem>
                      <SelectItem value="distribution">Distribuição</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="priority">
              {(field) => (
                <div className="space-y-2">
                  <Label>Prioridade *</Label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          <div className="space-y-2">
            <Label>Localização *</Label>
            <GeoSearch
              placeholder="Buscar endereço..."
              onSelect={handleGeoSelect}
            />
            <form.Subscribe selector={(state) => state.values}>
              {(values) =>
                values.latitude && values.longitude ? (
                  <p className="text-xs text-muted-foreground">
                    Lat: {values.latitude.toFixed(4)}, Lng: {values.longitude.toFixed(4)}
                    {values.city && ` — ${values.city}`}
                    {values.state && `/${values.state}`}
                  </p>
                ) : null
              }
            </form.Subscribe>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="phone">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="point-phone">Telefone</Label>
                  <Input
                    id="point-phone"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="operatingHours">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="point-hours">Horário</Label>
                  <Input
                    id="point-hours"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="08:00 - 18:00"
                  />
                </div>
              )}
            </form.Field>
          </div>

          {/* Needs section */}
          <div className="space-y-3">
            <Label>Necessidades</Label>

            {needs.length > 0 && (
              <ul className="space-y-1">
                {needs.map((need, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between text-sm bg-muted rounded px-3 py-2"
                  >
                    <span>
                      {need.description}
                      {need.quantity && need.unit
                        ? ` (${need.quantity} ${need.unit})`
                        : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNeed(i)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-2">
              <Input
                value={newNeedDesc}
                onChange={(e) => setNewNeedDesc(e.target.value)}
                placeholder="Descrição da necessidade"
                className="w-full"
              />
              <div className="flex gap-2">
                <Input
                  value={newNeedQty}
                  onChange={(e) => setNewNeedQty(e.target.value)}
                  placeholder="Qtd"
                  type="number"
                  className="w-20"
                />
                <Input
                  value={newNeedUnit}
                  onChange={(e) => setNewNeedUnit(e.target.value)}
                  placeholder="Unidade"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addNeed}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={createPointMutation.isPending}>
            {createPointMutation.isPending ? "Salvando..." : "Criar Ponto"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
