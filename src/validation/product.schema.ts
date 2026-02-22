import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  price: z.number().positive('Price must be a positive number').or(
    z.string().transform((val) => parseFloat(val)).pipe(z.number().positive('Price must be a positive number'))
  ),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Image must be a valid URL'),
});

export const updateProductSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  price: z.number().positive('Price must be a positive number').or(
    z.string().transform((val) => parseFloat(val)).pipe(z.number().positive('Price must be a positive number'))
  ).optional(),
  description: z.string().min(1, 'Description is required').optional(),
  image: z.string().url('Image must be a valid URL').optional(),
});

export const addFavoriteSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;
