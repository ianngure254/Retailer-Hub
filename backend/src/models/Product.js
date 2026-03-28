import mongoose from 'mongoose';

const variationSchema = new mongoose.Schema({
  specs: {
    type: Map,
    of: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price cannot be negative'],
    set: (val) => Math.round(val * 100) / 100
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9-]+$/, 'SKU can only contain letters, numbers, and hyphens']
  },
  images: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, { _id: true });

const productSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  // Top-level SKU is used throughout the controllers and frontend product flows.
  sku: {
    type: String,
    trim: true,
    uppercase: true,
    unique: true,
    sparse: true,
    match: [/^[A-Z0-9-]+$/, 'SKU can only contain letters, numbers, and hyphens']
  },
  category: {
    type: String,
    required: false
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Pricing
  pricing: {
    current: {
      type: Number,
      required: false,
      min: [0, 'Price cannot be negative'],
      set: (val) => Math.round(val * 100) / 100
    },
    suggested: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      set: (val) => Math.round(val * 100) / 100
    },
    range: {
      min: Number,
      max: Number
    },
    retailerModified: {
      type: Boolean,
      default: false
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Product variations
  variations: [variationSchema],
  
  // Images
  images: [{
    type: String,
    trim: true
  }],
  
  // Legacy fields for backward compatibility
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    set: (val) => Math.round(val * 100) / 100
  },
  stock: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Threshold cannot be negative']
  },
  unit: {
    type: String,
    enum: ['piece', 'kg', 'liter', 'box', 'pack', 'meter', 'other'],
    default: 'piece'
  },
  icon: {
    type: String,
    default: '📦'
  },
  totalSold: {
    type: Number,
    default: 0,
    min: 0
  },
  lastRestocked: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'template', 'csv_import'],
      default: 'manual'
    },
    similarProducts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    }],
    tags: [{
      type: String,
      trim: true
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

        //search by indexes.
        productSchema.index({name: 'text', sku: 'text'});
        productSchema.index({ stock: 1 });
        productSchema.index({ createdAt: -1 });

           //update stock after sale..
           productSchema.methods.reduceStock = async function (quantity) {
            if(this.stock < quantity) {
                throw new Error(`Insufficient stock. Available: ${this.stock}, Required: ${quantity} `);

            }
            this.stock -= quantity;
            this.totalSold += quantity;
            
            return await this.save();
           };

           //increase Stock
           productSchema.methods.increaseStock = async function(quantity) {
            this.stock += quantity;
            this.lastRestocked = new Date();
            return await this.save();
           }
           //Get low stock products
           productSchema.statics.getLowStockProducts = function () {
    return this.find({
    //isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  }).sort({ stock: 1 });

           }
           //Get product by category
           
           //search products
    productSchema.statics.searchProducts = function (query) {
  return this.find({
    $text: { $search: query }
  }).sort({ score: { $meta: 'textScore' } });
};

export default mongoose.model('Product', productSchema);
