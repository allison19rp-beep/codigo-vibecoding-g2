import { z } from "zod"

export const customerSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  customer_type: z.enum(["COMPANY", "INDIVIDUAL"]),
  tax_id: z.string().optional(),
  email: z.string().min(1, "El email es requerido").email("Email inválido"),
  phone: z.string().min(1, "El teléfono es requerido"),
  address: z.string().min(1, "La dirección es requerida"),
  city: z.string().min(1, "La ciudad es requerida"),
  country: z.string().optional(),
})

export type CustomerFormInput = z.infer<typeof customerSchema>
