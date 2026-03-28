import express from 'express';
import { getDailyReport } from '../controllers/reportController.js';

const router = express.Router();

// ============================================
// REPORT ROUTES
// ============================================

// GET /api/reports/daily - Daily sales report
router.get('/daily', getDailyReport);

export default router;
