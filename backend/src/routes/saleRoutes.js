import express from 'express';
import {
  createSale,
  getAllSales,
  getSaleById,
  getSalesByDateRange,
  deleteSale,
  getTodaySales
} from '../controllers/saleController.js';

const router = express.Router();

// ============================================
// SALES ROUTES
// ============================================

// GET /api/sales - Get all sales (with pagination)
router.get('/', getAllSales);

// GET /api/sales/today - Get today's sales
router.get('/today', getTodaySales);

// GET /api/sales/date-range - Get sales within date range
router.get('/date-range', getSalesByDateRange);

// GET /api/sales/:id - Get single sale
router.get('/:id', getSaleById);

// POST /api/sales - Create new sale (records transaction + updates stock)
router.post('/', createSale);

// DELETE /api/sales/:id - Delete sale (reverses stock deduction)
router.delete('/:id', deleteSale);

export default router;