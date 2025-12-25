import { z } from "zod"

const orderItemSchema = z.object({
  product: z.string().min(1, "Product id is required"),
  qty: z.number().int().min(1, "Quantity must be at least 1"),
})

const shippingAddressSchema = z.object({
  phone: z.string().min(7, "Phone is required"),
  county: z.string().optional(),
  city: z.string().min(1, "City is required"),
  street: z.string().min(1, "Street is required"),
  apartment: z.string().optional(),
  notes: z.string().optional(),
})

export const createOrderSchema = z.object({
  orderItems: z.array(orderItemSchema).min(1, "Order items are required"),
  shippingAddress: shippingAddressSchema,

  paymentMethod: z.enum(["cod", "card", "mpesa"]).optional(),

  // Client can send these, but server will re-calc to be safe
  itemsPrice: z.number().min(0).optional(),
  shippingPrice: z.number().min(0).optional(),
  totalPrice: z.number().min(0).optional(),
})
