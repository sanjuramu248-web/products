import { Router } from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addFavorite,
  removeFavorite,
  getFavorites,
} from '../controllers/product.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getProducts);
router.get('/favorites', getFavorites);
router.get('/:id', getProduct);

router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Favorite routes - support both formats
router.post('/favorites', addFavorite);
router.post('/:id/favorite', addFavorite);
router.delete('/favorites/:productId', removeFavorite);
router.delete('/:id/favorite', removeFavorite);

export default router;
