import { z } from "zod/v4";

export const pointTypeSchema = z.enum(["shelter", "collection", "distribution", "landslide", "burial"]);
export const priorityLevelSchema = z.enum(["high", "medium", "low"]);
export const pointStatusSchema = z.enum(["active", "inactive", "pending"]);

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const uuidSchema = z.string().regex(uuidRegex, "ID inválido");

export const createPointSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(150, "Nome muito longo"),
  description: z.string().max(2000, "Descrição muito longa").optional(),
  type: pointTypeSchema,
  priority: priorityLevelSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().max(300, "Endereço muito longo").optional(),
  city: z.string().max(100, "Cidade muito longa").optional(),
  state: z.string().length(2, "Estado deve ter 2 caracteres").optional(),
  neighborhood: z.string().max(100, "Bairro muito longo").optional(),
  phone: z.string().max(20, "Telefone muito longo").optional(),
  operating_hours: z
    .string()
    .max(100, "Horário muito longo")
    .optional(),
});

export const updatePointSchema = createPointSchema.partial();

export const needSchema = z.object({
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(300, "Descrição muito longa"),
  quantity: z.number().positive().optional(),
  unit: z.string().max(50, "Unidade muito longa").optional(),
});

export const updateNeedSchema = z.object({
  description: z
    .string()
    .min(1, "Descrição é obrigatória")
    .max(300, "Descrição muito longa")
    .optional(),
  quantity: z.number().positive().nullable().optional(),
  unit: z.string().max(50, "Unidade muito longa").nullable().optional(),
  is_fulfilled: z.boolean().optional(),
});

export type CreatePointInput = z.infer<typeof createPointSchema>;
export type NeedInput = z.infer<typeof needSchema>;
