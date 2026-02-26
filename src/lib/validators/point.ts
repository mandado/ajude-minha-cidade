import { z } from "zod/v4";

export const pointTypeSchema = z.enum(["shelter", "collection", "distribution"]);
export const priorityLevelSchema = z.enum(["high", "medium", "low"]);
export const pointStatusSchema = z.enum(["active", "inactive", "pending"]);

export const createPointSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  type: pointTypeSchema,
  priority: priorityLevelSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().length(2, "Estado deve ter 2 caracteres").optional(),
  neighborhood: z.string().optional(),
  phone: z.string().optional(),
  operating_hours: z.string().optional(),
});

export const needSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  quantity: z.number().positive().optional(),
  unit: z.string().optional(),
});

export type CreatePointInput = z.infer<typeof createPointSchema>;
export type NeedInput = z.infer<typeof needSchema>;
