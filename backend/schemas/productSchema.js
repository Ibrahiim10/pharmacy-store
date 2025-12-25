import { z } from "zod"

export const productValidationSchema = z.object({
  name: z.string().min(1, "Product name is required"),

  description: z.string().optional(),

  category: z.string().min(1, "Category is required"),

  price: z.number().min(0, "Price must be a positive number"),

  countInStock: z.number().min(0, "Stock must be zero or more"),

  prescriptionRequired: z.boolean().optional(),

  expiryDate: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    "Invalid expiry date"
  ),

  status: z.enum(["active", "inactive"]).optional(),
})
