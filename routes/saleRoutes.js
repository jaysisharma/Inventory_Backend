import express from 'express';
import {
  createSale,
  getAllSales,
  generateSalesReport
} from '../controllers/saleController.js';

const router = express.Router();

router.post('/', createSale);
router.get('/', getAllSales);
router.get('/report', generateSalesReport);

export default router;
