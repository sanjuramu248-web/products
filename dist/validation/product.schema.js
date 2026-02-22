"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addFavoriteSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
exports.createProductSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required'),
    price: zod_1.z.number().positive('Price must be a positive number').or(zod_1.z.string().transform((val) => parseFloat(val)).pipe(zod_1.z.number().positive('Price must be a positive number'))),
    description: zod_1.z.string().min(1, 'Description is required'),
    image: zod_1.z.string().url('Image must be a valid URL'),
});
exports.updateProductSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Title is required').optional(),
    price: zod_1.z.number().positive('Price must be a positive number').or(zod_1.z.string().transform((val) => parseFloat(val)).pipe(zod_1.z.number().positive('Price must be a positive number'))).optional(),
    description: zod_1.z.string().min(1, 'Description is required').optional(),
    image: zod_1.z.string().url('Image must be a valid URL').optional(),
});
exports.addFavoriteSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid('Invalid product ID'),
});
