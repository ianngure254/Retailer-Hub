import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const createProduct = asyncHandler(async (req, res, next) => {
  const { name, sku, price, stock, lowStockThreshold, category, description, unit } = req.body;

  // Validation
  if (!name || !sku || !price || stock === undefined) {
    throw new ApiError(400, 'Name, SKU, price, and stock are required');
  }

  // Normalize SKU
  const normalizedSku = sku.trim().toUpperCase();

  // Check if SKU already exists with detailed error
  try {
    const existingProduct = await Product.findOne({ sku: normalizedSku });
    if (existingProduct) {
      throw new ApiError(409, `Product with SKU '${normalizedSku}' already exists. Please use a different SKU.`);
    }
  } catch (error) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000 && error.keyPattern?.sku) {
      throw new ApiError(409, `Product with SKU '${normalizedSku}' already exists. Please use a different SKU.`);
    }
    throw error;
  }

  const createdProduct = await Product.create({
    name,
    sku: normalizedSku,
    price,
    stock,
    pricing: {
      current: parseFloat(price)
    },
    category: category || 'General',
    description: description || '',
    unit: unit || 'piece',
    lowStockThreshold: lowStockThreshold || 10,
    totalSold: 0
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: { product: createdProduct }
  });
});

const getAllProducts = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50, category, search } = req.query;
  
  // Build query
  const query = {};
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Product.countDocuments(query);

  res.status(200).json({
    success: true,
    message: 'Products retrieved successfully',
    data: {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json({
    success: true,
    message: 'Product retrieved successfully',
    data: { product }
  });
});

const updateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, lowStockThreshold, category, description, totalSold, unit } = req.body;

  // Validate numeric fields
  if (price !== undefined && (isNaN(price) || price < 0)) {
    throw new ApiError(400, 'Price must be a non-negative number');
  }
  
  if (stock !== undefined && (isNaN(stock) || stock < 0)) {
    throw new ApiError(400, 'Stock must be a non-negative number');
  }

  if (lowStockThreshold !== undefined && (isNaN(lowStockThreshold) || lowStockThreshold < 0)) {
    throw new ApiError(400, 'Low stock threshold must be a non-negative number');
  }

  if (totalSold !== undefined && (isNaN(totalSold) || totalSold < 0)) {
    throw new ApiError(400, 'Total sold must be a non-negative number');
  }

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Update fields
  if (name) product.name = name;
  if (price !== undefined) {
    product.price = price;
    if (!product.pricing) product.pricing = {};
    product.pricing.current = parseFloat(price);
  }
  if (stock !== undefined) product.stock = stock;
  if (lowStockThreshold !== undefined) product.lowStockThreshold = lowStockThreshold;
  if (category) product.category = category;
  if (description !== undefined) product.description = description;
  if (totalSold !== undefined) product.totalSold = totalSold;
  if (unit !== undefined) product.unit = unit;

  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    data: { product }
  });
});

const deleteProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  await Product.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Product deleted successfully'
  });
});

const searchProducts = asyncHandler(async (req, res, next) => {
  const { q, category } = req.query;
  
  if (!q) {
    throw new ApiError(400, 'Search query is required');
  }

  const query = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { sku: { $regex: q, $options: 'i' } },
      { category: { $regex: q, $options: 'i' } }
    ]
  };

  if (category) query.category = category;

  const products = await Product.find(query).sort({ name: 1 });

  res.status(200).json({
    success: true,
    message: 'Products found',
    data: { products }
  });
});

const getLowStockProducts = asyncHandler(async (req, res, next) => {
  const { threshold = 10 } = req.query;

  const products = await Product.find({
    $expr: { $lte: ['$stock', '$lowStockThreshold'] },
    stock: { $gt: 0 }
  }).sort({ stock: 1 });

  res.status(200).json({
    success: true,
    message: 'Low stock products retrieved',
    data: { products }
  });
});

const deactivateProduct = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  product.isActive = false;
  await product.save();

  res.status(200).json({
    success: true,
    message: 'Product deactivated successfully',
    data: { product }
  });
});

const bulkImportProducts = asyncHandler(async (req, res, next) => {
  const { products } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    throw new ApiError(400, 'Products array is required');
  }

  const results = {
    upsertedCount: 0,
    modifiedCount: 0,
    errors: []
  };

  for (const productData of products) {
    try {
      const { sku, name, price, stock, lowStockThreshold } = productData;

      if (!sku || !name || price === undefined || stock === undefined) {
        results.errors.push({
          sku: sku || 'unknown',
          error: 'Missing required fields (sku, name, price, stock)'
        });
        continue;
      }

      const existingProduct = await Product.findOne({ sku });
      
      if (existingProduct) {
        // Update existing product
        existingProduct.name = name;
        existingProduct.price = price;
        existingProduct.stock += stock;
        existingProduct.lowStockThreshold = lowStockThreshold || 10;
        await existingProduct.save();
        results.modifiedCount++;
      } else {
        // Create new product
        await Product.create({
          sku,
          name,
          price,
          stock,
          lowStockThreshold: lowStockThreshold || 10,
          totalSold: 0
        });
        results.upsertedCount++;
      }
    } catch (error) {
      results.errors.push({
        sku: productData.sku || 'unknown',
        error: error.message
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Bulk import completed',
    data: results
  });
});

const cleanupNullSKUs = asyncHandler(async (req, res, next) => {
  const result = await Product.deleteMany({ sku: null });
  res.status(200).json({
    success: true,
    message: `Cleaned up ${result.deletedCount} products with null SKUs`,
    data: { deletedCount: result.deletedCount }
  });
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  searchProducts,
  getLowStockProducts,
  deactivateProduct,
  bulkImportProducts,
  cleanupNullSKUs
}


//improve error handling
