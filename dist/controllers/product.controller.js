"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFavorites = exports.removeFavorite = exports.addFavorite = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getProducts = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const product_schema_1 = require("../validation/product.schema");
const getProducts = async (req, res) => {
    try {
        const { search = '', page = '1', limit = '10' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const where = search
            ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [products, total] = await Promise.all([
            prisma_1.default.product.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    favorites: {
                        where: { userId: req.userId },
                        select: { id: true },
                    },
                },
            }),
            prisma_1.default.product.count({ where }),
        ]);
        const productsWithFavorite = products.map((product) => ({
            ...product,
            isFavorite: product.favorites.length > 0,
            favorites: undefined,
        }));
        res.json({
            products: productsWithFavorite,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit)),
            },
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getProducts = getProducts;
const getProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (Array.isArray(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        const product = await prisma_1.default.product.findUnique({
            where: { id },
            include: {
                favorites: {
                    where: { userId: req.userId },
                    select: { id: true },
                },
            },
        });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const { favorites, ...productData } = product;
        res.json({
            ...productData,
            isFavorite: favorites.length > 0,
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getProduct = getProduct;
const createProduct = async (req, res) => {
    try {
        const validationResult = product_schema_1.createProductSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        const { title, price, description, image } = validationResult.data;
        const product = await prisma_1.default.product.create({
            data: { title, price: typeof price === 'string' ? parseFloat(price) : price, description, image },
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (Array.isArray(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        const validationResult = product_schema_1.updateProductSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                error: 'Validation failed',
                details: validationResult.error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        const { title, price, description, image } = validationResult.data;
        const updateData = {};
        if (title !== undefined)
            updateData.title = title;
        if (price !== undefined)
            updateData.price = typeof price === 'string' ? parseFloat(price) : price;
        if (description !== undefined)
            updateData.description = description;
        if (image !== undefined)
            updateData.image = image;
        const product = await prisma_1.default.product.update({
            where: { id },
            data: updateData,
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (Array.isArray(id)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        await prisma_1.default.product.delete({ where: { id } });
        res.json({ message: 'Product deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteProduct = deleteProduct;
const addFavorite = async (req, res) => {
    try {
        const productId = req.params.id || req.body.productId;
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        if (Array.isArray(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        const favorite = await prisma_1.default.favorite.create({
            data: {
                userId: req.userId,
                productId,
            },
        });
        res.status(201).json({ message: 'Added to favorites', favorite });
    }
    catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Already in favorites' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};
exports.addFavorite = addFavorite;
const removeFavorite = async (req, res) => {
    try {
        const productId = req.params.productId || req.params.id;
        if (!productId) {
            return res.status(400).json({ error: 'Product ID is required' });
        }
        if (Array.isArray(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        await prisma_1.default.favorite.deleteMany({
            where: {
                userId: req.userId,
                productId,
            },
        });
        res.json({ message: 'Removed from favorites' });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.removeFavorite = removeFavorite;
const getFavorites = async (req, res) => {
    try {
        const favorites = await prisma_1.default.favorite.findMany({
            where: { userId: req.userId },
            include: { product: true },
        });
        res.json(favorites.map((f) => ({ ...f.product, isFavorite: true })));
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.getFavorites = getFavorites;
