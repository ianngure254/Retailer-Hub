import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const createSale = asyncHandler(async (req, res) => {
  const { items, paymentMethod } = req.body;

  // Validation
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Sale items are required');
  }
  if (!paymentMethod) {
    throw new ApiError(400, 'Payment method is required');
  }

  let totalAmount = 0;
  const saleItems = [];

  for (const item of items) {
    const { productId, quantity, unitPrice } = item;

    if (!productId || !quantity || quantity <= 0) {
      throw new ApiError(400, 'Valid product ID and quantity are required for each item');
    }

    // Fetch product for validation only — DO NOT .save() it
    const product = await Product.findById(productId);
    if (!product) {
      throw new ApiError(404, `Product with ID ${productId} not found`);
    }
    if (product.stock < quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`);
    }

    const resolvedPrice = unitPrice || product.price;
    const itemTotal = quantity * resolvedPrice;
    totalAmount += itemTotal;

    saleItems.push({
      productId: product._id,
      productName: product.name,
      sku: product.sku || '',
      quantity,
      unitPrice: resolvedPrice,
      total: itemTotal
    });

    // ✅ Atomic update — avoids unique index trigger, no race conditions
    await Product.findByIdAndUpdate(productId, {
      $inc: { stock: -quantity, totalSold: quantity }
    });
  }

  // Create sale record
  const sale = await Sale.create({
    items: saleItems,
    totalAmount,
    paymentMethod,
    status: 'completed',
    saleDate: new Date()
  });

  const populatedSale = await Sale.findById(sale._id)
    .populate('items.productId', 'name sku');

  res.status(201).json({
    success: true,
    message: 'Sale completed successfully',
    data: { sale: populatedSale }
  });
});

// No changes below — all other controllers are clean
const getAllSales = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, status, paymentMethod, startDate, endDate } = req.query;

  const query = {};
  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (startDate || endDate) {
    query.saleDate = {};
    if (startDate) query.saleDate.$gte = new Date(startDate);
    if (endDate) query.saleDate.$lte = new Date(endDate);
  }

  const [sales, total] = await Promise.all([
    Sale.find(query)
      .sort({ saleDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.productId', 'name sku'),
    Sale.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    message: 'Sales retrieved successfully',
    data: {
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getSaleById = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id)
    .populate('items.productId', 'name sku');

  if (!sale) throw new ApiError(404, 'Sale not found');

  res.status(200).json({
    success: true,
    message: 'Sale retrieved successfully',
    data: { sale }
  });
});

const getSalesByDateRange = asyncHandler(async (req, res) => {
  const { startDate, endDate, page = 1, limit = 50 } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(400, 'Start date and end date are required');
  }

  const query = {
    saleDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
  };

  const [sales, total] = await Promise.all([
    Sale.find(query)
      .sort({ saleDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('items.productId', 'name sku'),
    Sale.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    message: 'Sales retrieved successfully',
    data: {
      sales,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findById(req.params.id);
  if (!sale) throw new ApiError(404, 'Sale not found');

  // ✅ Atomic stock restore — same pattern as createSale
  if (sale.status === 'completed') {
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.quantity, totalSold: -item.quantity }
      });
    }
  }

  await Sale.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Sale deleted and stock restored successfully'
  });
});

const getTodaySales = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const sales = await Sale.find({
    saleDate: { $gte: startOfDay, $lte: endOfDay }
  })
    .sort({ saleDate: -1 })
    .populate('items.productId', 'name sku');

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalItemsSold = sales.reduce((sum, sale) =>
    sum + sale.items.reduce((s, item) => s + item.quantity, 0), 0
  );

  res.status(200).json({
    success: true,
    message: "Today's sales retrieved successfully",
    data: {
      sales,
      summary: {
        totalSales: sales.length,
        totalRevenue,
        totalItemsSold,
        date: startOfDay.toISOString().split('T')[0]
      }
    }
  });
});

export { createSale, getAllSales, getSaleById, getSalesByDateRange, deleteSale, getTodaySales };