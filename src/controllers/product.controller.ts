import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import prisma from '../lib/prisma';
import { createProductSchema, updateProductSchema, addFavoriteSchema } from '../validation/product.schema';

export const getProducts = async (req: AuthRequest, res: Response) => {
  try {
    const { search = '', page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where = search
      ? {
          OR: [
            { title: { contains: search as string, mode: 'insensitive' as const } },
            { description: { contains: search as string, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          favorites: {
            where: { userId: req.userId },
            select: { id: true },
          },
        },
      }),
      prisma.product.count({ where }),
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
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const product = await prisma.product.findUnique({
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

    const { favorites, ...productData } = product as typeof product & { favorites: { id: string }[] };

    res.json({
      ...productData,
      isFavorite: favorites.length > 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response) => {
  try {
    const validationResult = createProductSchema.safeParse(req.body);
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

    const product = await prisma.product.create({
      data: { title, price: typeof price === 'string' ? parseFloat(price) : price, description, image },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const validationResult = updateProductSchema.safeParse(req.body);
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

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (price !== undefined) updateData.price = typeof price === 'string' ? parseFloat(price) : price;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (Array.isArray(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const addFavorite = async (req: AuthRequest, res: Response) => {
  try {
    // Support both body.productId and params.id
    const productId = req.params.id || req.body.productId;
    
    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (Array.isArray(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: req.userId!,
        productId,
      },
    });

    res.status(201).json({ message: 'Added to favorites', favorite });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Already in favorites' });
    }
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeFavorite = async (req: AuthRequest, res: Response) => {
  try {
    // Support both params.productId and params.id
    const productId = req.params.productId || req.params.id;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    if (Array.isArray(productId)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    await prisma.favorite.deleteMany({
      where: {
        userId: req.userId!,
        productId,
      },
    });

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId! },
      include: { product: true },
    });

    res.json(favorites.map((f) => ({ ...f.product, isFavorite: true })));
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
