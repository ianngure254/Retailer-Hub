import Notification from '../models/Notification.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

const getNotifications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20, type, isRead } = req.query;
  
  // Build query
  const query = {};
  if (type) query.type = type;
  if (isRead !== undefined) query.isRead = isRead === 'true';

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ isRead: false });

  res.status(200).json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    }
  });
});

const markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  notification.isRead = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as read',
    data: { notification }
  });
});

const markAllAsRead = asyncHandler(async (req, res, next) => {
  const result = await Notification.updateMany(
    { isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read',
    data: { updatedCount: result.modifiedCount }
  });
});

const deleteNotification = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  await Notification.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

const getUnreadCount = asyncHandler(async (req, res, next) => {
  const unreadCount = await Notification.countDocuments({ isRead: false });

  res.status(200).json({
    success: true,
    message: 'Unread count retrieved',
    data: { unreadCount }
  });
});

// Helper function to create notifications (used by other controllers)
export const createNotification = async (type, title, message, metadata = {}) => {
  try {
    const notification = await Notification.create({
      type,
      title,
      message,
      metadata,
      isRead: false
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new ApiError(500, 'Failed to create notification');
  }
};

// Auto-generate low stock notifications
export const checkLowStockNotifications = async () => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      stock: { $gt: 0 }
    });

    for (const product of lowStockProducts) {
      // Check if notification already exists for this product
      const existingNotification = await Notification.findOne({
        type: 'low_stock',
        'metadata.productId': product._id,
        isRead: false
      });

      if (!existingNotification) {
        await createNotification(
          'low_stock',
          `Low Stock Alert: ${product.name}`,
          `Product "${product.name}" is running low on stock. Current stock: ${product.stock} units`,
          { productId: product._id, productName: product.name, currentStock: product.stock }
        );
      }
    }
  } catch (error) {
    console.error('Error checking low stock notifications:', error);
  }
};

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
