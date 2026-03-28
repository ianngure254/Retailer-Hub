import express from 'express';
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct, searchProducts, getLowStockProducts } from '../controllers/productController.js';

const router = express.Router();

router.post('/', createProduct);
router.get('/search', searchProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.patch('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;