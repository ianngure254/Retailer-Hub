import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['low_stock', 'out_of_stock', 'high_sales', 'system', 'info'],
      required: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    relatedProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    relatedSale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date
    },
    readBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    expiresAt: {
      type: Date,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// ============================================
// INDEXES
// ============================================
notificationSchema.index({ type: 1, isRead: 1 });
notificationSchema.index({ priority: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });
//notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// ============================================
// STATIC METHODS
// ============================================

// Create low stock notification
notificationSchema.statics.createLowStockAlert = async function (product) {
  return await this.create({
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: `${product.name} (SKU: ${product.sku}) is running low. Current stock: ${product.stock}`,
    priority: product.stock === 0 ? 'urgent' : 'high',
    relatedProduct: product._id,
    metadata: {
      productId: product._id,
      productName: product.name,
      sku: product.sku,
      currentStock: product.stock,
      threshold: product.lowStockThreshold
    }
  });
};

// Create out of stock notification
notificationSchema.statics.createOutOfStockAlert = async function (product) {
  return await this.create({
    type: 'out_of_stock',
    title: 'Out of Stock',
    message: `${product.name} (SKU: ${product.sku}) is out of stock!`,
    priority: 'urgent',
    relatedProduct: product._id,
    metadata: {
      productId: product._id,
      productName: product.name,
      sku: product.sku
    }
  });
};

// Get unread notifications
notificationSchema.statics.getUnread = function () {
  return this.find({ isRead: false })
    .populate('relatedProduct', 'name sku stock')
    .sort({ priority: -1, createdAt: -1 });
};

// Mark as read
notificationSchema.methods.markAsRead = async function (userId) {
  this.isRead = true;
  this.readAt = new Date();
  this.readBy = userId;
  return await this.save();
};

// Mark multiple as read
notificationSchema.statics.markMultipleAsRead = async function (ids, userId) {
  return await this.updateMany(
    { _id: { $in: ids } },
    {
      isRead: true,
      readAt: new Date(),
      readBy: userId
    }
  );
};

// Delete old notifications (manual cleanup if TTL not working)
notificationSchema.statics.deleteExpired = async function () {
  return await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

export default mongoose.model('Notification', notificationSchema);