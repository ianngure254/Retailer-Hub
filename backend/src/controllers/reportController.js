import Product from '../models/Product.js';
import Sale from '../models/Sale.js';

import asyncHandler from '../utils/asyncHandler.js';

const getDailyReport = asyncHandler(async (req, res, next) => {
  const { date } = req.query;
  
  const reportDate = date ? new Date(date) : new Date();
  const startOfDay = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(reportDate.getFullYear(), reportDate.getMonth(), reportDate.getDate(), 23, 59, 59, 999);

  // Query actual sales for the given day
  const sales = await Sale.find({
    saleDate: { $gte: startOfDay, $lte: endOfDay }
  }).populate('items.productId', 'name sku');

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
  const totalItemsSold = sales.reduce((sum, sale) =>
    sum + sale.items.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0
  );

  // Build per-product breakdown from sales
  const productMap = {};
  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.productId?._id?.toString() || item.productId?.toString() || 'unknown';
      if (!productMap[key]) {
        productMap[key] = {
          productId: key,
          productName: item.productName,
          sku: item.sku || '',
          quantitySold: 0,
          totalAmount: 0,
        };
      }
      productMap[key].quantitySold += item.quantity;
      productMap[key].totalAmount += item.total;
    }
  }

  const productSales = Object.values(productMap).sort((a, b) => b.quantitySold - a.quantitySold);

  const report = {
    date: startOfDay.toISOString().split('T')[0],
    summary: {
      totalRevenue,
      totalItemsSold,
      totalTransactions: sales.length,
    },
    products: productSales
  };

  res.status(200).json({
    success: true,
    message: 'Daily report generated successfully',
    data: report
  });
});

export { getDailyReport };