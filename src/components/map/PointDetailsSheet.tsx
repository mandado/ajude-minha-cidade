"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import {
  Trash2,
  Pencil,
  Plus,
  Check,
  X,
  MapPin,
  Phone,
  Clock,
  AlertTriangle,
  Package,
  House,
  Truck,
  MountainSnow,
  TriangleAlert,
} from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  useUpdatePoint,
  useDeletePoint,
  useAddNeed,
  useUpdateNeed,
  useDeleteNeed,
} from "@/hooks/usePointMutations";
import type { MapPoint } from "@/types/map";
import { POINT_TYPE_LABELS, POINT_TYPE_COLORS } from "@/types/map";
import type { Need, PointType } from "@/types/database";
import { ModerationButtons } from "./ModerationButtons";
import { useLocationWeather, useINMETAlerts } from "@/hooks/useWeather";
import { getWeatherInfo } from "@/types/weather";

const TYPE_ICON_MAP: Record<PointType, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  shelter: House,
  collection: Package,
  distribution: Truck,
  landslide: MountainSnow,
  burial: TriangleAlert,
};

interface PointDetailsSheetProps {
  point: MapPoint | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOwner: boolean;
}

export function PointDetailsSheet({
  point,
  open,
  onOpenChange,
  isOwner,
}: PointDetailsSheetProps) {
  const [editMode, setEditMode] = useState(false);

  if (!point) return null;

  const handleClose = (value: boolean) => {
    if (!value) setEditMode(false);
    onOpenChange(value);
  };

  const pendingNeeds = point.needs.filter((n) => !n.is_fulfilled);
  const fulfilledNeeds = point.needs.filter((n) => n.is_fulfilled);
  const TypeIcon = TYPE_ICON_MAP[point.type] ?? MapPin;

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent>
        <div className="overflow-y-auto flex-1">
          <DrawerHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <span
                  className="flex items-center justify-center size-9 rounded-lg shrink-0 mt-0.5"
                  style={{ backgroundColor: `${POINT_TYPE_COLORS[point.type]}15` }}
                >
                  <TypeIcon className="size-5" style={{ color: POINT_TYPE_COLORS[point.type] }} />
                </span>
                <div className="min-w-0">
                  <DrawerTitle className="text-left">{point.name}</DrawerTitle>
                  <DrawerDescription asChild>
                    <span className="flex flex-wrap gap-1 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {POINT_TYPE_LABELS[point.type]}
                      </Badge>
                    </span>
                  </DrawerDescription>
                </div>
              </div>
              {isOwner && !editMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setEditMode(true)}
                >
                  <Pencil className="size-3.5 mr-1" />
                  Editar
                </Button>
              )}
              {isOwner && editMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0"
                  onClick={() => setEditMode(false)}
                >
                  <X className="size-3.5 mr-1" />
                  Sair
                </Button>
              )}
            </div>
          </DrawerHeader>

          <div className="space-y-4 px-4 pb-8">
            {editMode ? (
              <EditPointInfo point={point} onDone={() => setEditMode(false)} />
            ) : (
              <PointInfoReadOnly point={point} />
            )}

            {/* Weather info */}
            <PointWeatherInfo point={point} />

            {/* Moderation */}
            {!editMode && <ModerationButtons point={point} />}

            {/* Needs section */}
            <div className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 mb-3">
                <Package className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Necessidades</span>
                {point.needs.length > 0 && pendingNeeds.length > 0 && (
                  <span className="text-xs text-orange-600 ml-auto">
                    {pendingNeeds.length} pendente{pendingNeeds.length !== 1 ? "s" : ""}
                  </span>
                )}
                {point.needs.length > 0 && pendingNeeds.length === 0 && (
                  <span className="text-xs text-green-600 ml-auto">
                    todas atendidas
                  </span>
                )}
              </div>

              {point.needs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma necessidade cadastrada.
                </p>
              )}

              {/* Pending needs */}
              {pendingNeeds.length > 0 && (
                <ul className={editMode ? "space-y-2" : "space-y-1.5"}>
                  {pendingNeeds.map((need) => (
                    <NeedItem
                      key={need.id}
                      need={need}
                      editMode={editMode}
                    />
                  ))}
                </ul>
              )}

              {/* Fulfilled needs */}
              {fulfilledNeeds.length > 0 && (
                <div className={pendingNeeds.length > 0 ? "mt-3 pt-3 border-t" : ""}>
                  {pendingNeeds.length > 0 && (
                    <p className="text-xs text-muted-foreground mb-1.5">
                      Atendidas
                    </p>
                  )}
                  <ul className={editMode ? "space-y-2" : "space-y-1.5"}>
                    {fulfilledNeeds.map((need) => (
                      <NeedItem
                        key={need.id}
                        need={need}
                        editMode={editMode}
                      />
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Add need form (edit mode only) */}
            {editMode && (
              <AddNeedForm pointId={point.id} />
            )}

            {/* Delete point (edit mode only) */}
            {editMode && (
              <DeletePointButton
                pointId={point.id}
                onDeleted={() => handleClose(false)}
              />
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function PointInfoReadOnly({ point }: { point: MapPoint }) {
  return (
    <div className="space-y-3">
      {point.description && (
        <p className="text-sm text-muted-foreground">{point.description}</p>
      )}

      {/* Info cards */}
      <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
        {point.address && (
          <div className="flex items-start gap-2.5">
            <MapPin className="size-4 shrink-0 mt-0.5 text-muted-foreground" />
            <span className="text-sm">
              {point.address}
              {point.neighborhood && `, ${point.neighborhood}`}
              {point.city && ` — ${point.city}`}
              {point.state && `/${point.state}`}
            </span>
          </div>
        )}
        {point.phone && (
          <div className="flex items-center gap-2.5">
            <Phone className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">{point.phone}</span>
          </div>
        )}
        {point.operating_hours && (
          <div className="flex items-center gap-2.5">
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <span className="text-sm">{point.operating_hours}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function EditPointInfo({
  point,
  onDone,
}: {
  point: MapPoint;
  onDone: () => void;
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  const updatePointMutation = useUpdatePoint();

  const form = useForm({
    defaultValues: {
      name: point.name,
      description: point.description ?? "",
      type: point.type as string,
      address: point.address ?? "",
      city: point.city ?? "",
      state: point.state ?? "",
      neighborhood: point.neighborhood ?? "",
      phone: point.phone ?? "",
      latitude: point.latitude,
      longitude: point.longitude,
      operatingHours: point.operating_hours ?? "",
    },
    onSubmit: async ({ value }) => {
      const result = await updatePointMutation.mutateAsync({
        pointId: point.id,
        data: {
          name: value.name,
          description: value.description || null,
          type: value.type,
          latitude: value.latitude,
          longitude: value.longitude,
          address: value.address || null,
          city: value.city || null,
          state: value.state || null,
          neighborhood: value.neighborhood || null,
          phone: value.phone || null,
          operating_hours: value.operatingHours || null,
        },
      });
      if (result.success) {
        onDone();
      }
    },
  });

  const handleGeoSelect = (result: GeoSearchResult) => {
    form.setFieldValue("address", result.displayName);
    form.setFieldValue("city", result.city);
    form.setFieldValue("state", result.state);
    form.setFieldValue("neighborhood", result.neighborhood);
    form.setFieldValue("latitude", result.latitude);
    form.setFieldValue("longitude", result.longitude);
  };

  return (
    <div className="space-y-4 rounded-md border p-3">
      <form.Field
        name="name"
        validators={{
          onBlur: ({ value }) =>
            value.trim().length < 3 ? "Nome deve ter pelo menos 3 caracteres" : undefined,
          onSubmit: ({ value }) =>
            value.trim().length < 3 ? "Nome deve ter pelo menos 3 caracteres" : undefined,
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
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
            <Label>Descrição</Label>
            <Textarea
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Descrição do ponto"
              rows={3}
            />
          </div>
        )}
      </form.Field>

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
                <SelectItem value="landslide">Deslizamento</SelectItem>
                <SelectItem value="burial">Soterramento</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <div className="space-y-2">
        <Label>Localização</Label>
        <GeoSearch
          placeholder="Buscar novo endereço..."
          onSelect={handleGeoSelect}
        />
        <form.Subscribe selector={(state) => state.values}>
          {(values) =>
            values.address || values.city ? (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3" />
                {values.address}
                {values.neighborhood && `, ${values.neighborhood}`}
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
              <Label>Telefone</Label>
              <Input
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
              <Label>Horário</Label>
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="08:00 - 18:00"
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            form.reset();
            onDone();
          }}
          disabled={updatePointMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={() => setShowConfirm(true)}
          disabled={updatePointMutation.isPending}
        >
          {updatePointMutation.isPending ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alteração</AlertDialogTitle>
            <AlertDialogDescription>
              Este é um serviço comunitário. As informações deste ponto são
              usadas por pessoas em situação de emergência. Dados incorretos
              podem impactar vidas. Tem certeza de que as informações estão
              corretas?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Revisar</AlertDialogCancel>
            <AlertDialogAction onClick={() => form.handleSubmit()}>
              Confirmar e salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NeedItem({
  need,
  editMode,
}: {
  need: Need;
  editMode: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const updateNeedMutation = useUpdateNeed();
  const deleteNeedMutation = useDeleteNeed();

  const form = useForm({
    defaultValues: {
      description: need.description,
      quantity: need.quantity?.toString() ?? "",
      unit: need.unit ?? "",
    },
    onSubmit: async ({ value }) => {
      const result = await updateNeedMutation.mutateAsync({
        needId: need.id,
        data: {
          description: value.description,
          quantity: value.quantity ? Number(value.quantity) : null,
          unit: value.unit || null,
        },
      });
      if (result.success) {
        setEditing(false);
      }
    },
  });

  const handleToggleFulfilled = () => {
    updateNeedMutation.mutate({
      needId: need.id,
      data: { is_fulfilled: !need.is_fulfilled },
    });
  };

  const handleDelete = () => {
    deleteNeedMutation.mutate(need.id);
  };

  const isPending = updateNeedMutation.isPending || deleteNeedMutation.isPending;

  if (editing && editMode) {
    return (
      <li className="flex flex-col gap-2 rounded-md border p-2">
        <form.Field name="description">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Descrição"
              className="text-sm"
            />
          )}
        </form.Field>
        <div className="flex gap-2">
          <form.Field name="quantity">
            {(field) => (
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Qtd"
                type="number"
                className="text-sm w-20"
              />
            )}
          </form.Field>
          <form.Field name="unit">
            {(field) => (
              <Input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Unidade"
                className="text-sm flex-1"
              />
            )}
          </form.Field>
        </div>
        <div className="flex gap-1 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(false)}
            disabled={isPending}
          >
            <X className="size-4" />
          </Button>
          <Button
            size="sm"
            onClick={() => form.handleSubmit()}
            disabled={isPending}
          >
            <Check className="size-4" />
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 text-sm">
      {editMode && (
        <input
          type="checkbox"
          checked={need.is_fulfilled}
          onChange={handleToggleFulfilled}
          disabled={isPending}
          className="size-5 shrink-0"
        />
      )}
      {!editMode && (
        <span
          className={`size-2 rounded-full shrink-0 ${need.is_fulfilled ? "bg-green-500" : "bg-orange-500"}`}
        />
      )}
      <span
        className={`flex-1 ${need.is_fulfilled ? "line-through text-muted-foreground" : ""}`}
      >
        {need.description}
        {need.quantity && need.unit
          ? ` (${need.quantity} ${need.unit})`
          : ""}
      </span>
      {!editMode && need.is_fulfilled && (
        <Badge variant="secondary" className="text-xs shrink-0">
          Atendida
        </Badge>
      )}
      {editMode && (
        <div className="flex gap-1 shrink-0">
          <Button
            size="icon"
            variant="ghost"
            className="size-9"
            onClick={() => setEditing(true)}
            disabled={isPending}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-9 text-destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </li>
  );
}

function AddNeedForm({ pointId }: { pointId: string }) {
  const addNeedMutation = useAddNeed();

  const form = useForm({
    defaultValues: {
      description: "",
      quantity: "",
      unit: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.description.trim()) return;

      const result = await addNeedMutation.mutateAsync({
        pointId,
        need: {
          description: value.description.trim(),
          quantity: value.quantity ? Number(value.quantity) : undefined,
          unit: value.unit || undefined,
        },
      });
      if (result.success) {
        form.reset();
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-2"
    >
      <h4 className="text-sm font-semibold">Adicionar necessidade</h4>
      <form.Field name="description">
        {(field) => (
          <Input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Descrição da necessidade"
            className="text-sm"
          />
        )}
      </form.Field>
      <div className="flex gap-2">
        <form.Field name="quantity">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Qtd"
              type="number"
              className="text-sm w-20"
            />
          )}
        </form.Field>
        <form.Field name="unit">
          {(field) => (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="Unidade (ex: kg, un)"
              className="text-sm flex-1"
            />
          )}
        </form.Field>
      </div>
      <form.Subscribe selector={(state) => state.values.description}>
        {(description) => (
          <Button
            type="submit"
            size="sm"
            className="w-full"
            disabled={addNeedMutation.isPending || !description.trim()}
          >
            <Plus className="size-4 mr-1" />
            Adicionar
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

function DeletePointButton({
  pointId,
  onDeleted,
}: {
  pointId: string;
  onDeleted: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const deletePointMutation = useDeletePoint();

  const handleDelete = async () => {
    const result = await deletePointMutation.mutateAsync(pointId);
    if (result.success) {
      onDeleted();
    }
  };

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="w-full text-destructive hover:text-destructive"
        onClick={() => setConfirming(true)}
      >
        <Trash2 className="size-4 mr-1" />
        Remover ponto
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="destructive"
        size="sm"
        className="flex-1"
        onClick={handleDelete}
        disabled={deletePointMutation.isPending}
      >
        {deletePointMutation.isPending ? "Removendo..." : "Confirmar remoção"}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirming(false)}
        disabled={deletePointMutation.isPending}
      >
        Cancelar
      </Button>
    </div>
  );
}

function PointWeatherInfo({ point }: { point: MapPoint }) {
  const { data: weather } = useLocationWeather(
    point.latitude,
    point.longitude,
  );
  const { data: alerts } = useINMETAlerts();

  const cityAlert = alerts?.find((a) =>
    point.city
      ? a.municipios.toLowerCase().includes(point.city.toLowerCase())
      : false,
  );

  if (!weather && !cityAlert) return null;

  const info = weather ? getWeatherInfo(weather.current.weatherCode) : null;
  const rain24h = weather?.daily[0]?.precipitationSum ?? 0;

  return (
    <div className="mt-2 rounded-md border bg-muted/50 p-2 space-y-1">
      {weather && info && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-base">{info.icon}</span>
          <span className="font-medium">
            {weather.current.temperature.toFixed(0)}°C
          </span>
          <span className="text-muted-foreground">{info.label}</span>
          {rain24h > 0 && (
            <span className="text-xs text-blue-600 ml-auto">
              Chuva prevista: {rain24h.toFixed(1)} mm/24h
            </span>
          )}
        </div>
      )}
      {cityAlert && (
        <div className="flex items-center gap-1.5 text-xs text-orange-700">
          <AlertTriangle className="size-3.5 shrink-0" />
          <span className="font-medium">
            Alerta {cityAlert.severidade}: {cityAlert.descricao}
          </span>
        </div>
      )}
    </div>
  );
}
