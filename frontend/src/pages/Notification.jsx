import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, Package, RefreshCw, X } from 'lucide-react';
import { useProducts } from '../Hooks/useProducts';
import { notificationAPI } from '../api/notification.api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const Notification = () => {
  const { products, loading: productsLoading } = useProducts();
  const queryClient = useQueryClient();

  // Fetch backend notifications
  const { data: backendData, isLoading: notifLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll(),
    refetchInterval: 30000,
  });

  const backendNotifications = backendData?.data?.data?.notifications || [];

  // Mark single as read
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
  });

  // Generate client-side stock alerts from products (as a supplement)
  const stockAlerts = useMemo(() => {
    if (!products || !Array.isArray(products) || products.length === 0) return [];

    const alerts = [];

    products.forEach(product => {
      if (!product || typeof product.stock !== 'number') return;

      if (product.stock === 0) {
        alerts.push({
          id: `out-of-stock-${product._id}`,
          type: 'out-of-stock',
          title: 'Out of Stock',
          message: `${product.name || 'Unknown Product'} is completely out of stock. Please restock soon.`,
          product,
        });
      } else if (product.stock <= 5) {
        alerts.push({
          id: `critical-stock-${product._id}`,
          type: 'critical-stock',
          title: '🚨 Critical Stock Alert',
          message: `${product.name || 'Unknown Product'} has only ${product.stock} ${product.unit || 'pieces'} remaining!`,
          product,
          urgency: 'high',
        });
      } else if (product.stock <= (product.lowStockThreshold || 10)) {
        alerts.push({
          id: `low-stock-${product._id}`,
          type: 'low-stock',
          title: '⚠️ Low Stock Alert',
          message: `${product.name || 'Unknown Product'} is running low. Only ${product.stock} ${product.unit || 'pieces'} remaining.`,
          product,
          urgency: 'medium',
        });
      }
    });

    return alerts;
  }, [products]);

  // Combine backend + stock alerts
  const allNotifications = [
    ...backendNotifications.filter(n => !n.isRead).map(n => ({
      id: n._id,
      type: n.type,
      title: n.title,
      message: n.message,
      product: null,
      isBackend: true,
    })),
    ...stockAlerts,
  ];

  const handleClear = (notification) => {
    if (notification.isBackend) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const handleClearAll = () => {
    markAllAsReadMutation.mutate();
  };

  if (productsLoading || notifLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        {allNotifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>
      
      {allNotifications.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Package className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
          <p className="text-gray-500">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`border-l-4 p-4 rounded-lg relative ${
                notification.type === 'out-of-stock' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              {notification.isBackend && (
                <button
                  onClick={() => handleClear(notification)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {notification.type === 'out-of-stock' ? (
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  ) : (
                    <Package className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className={`text-sm font-medium ${
                    notification.type === 'out-of-stock' 
                      ? 'text-red-800' 
                      : 'text-yellow-800'
                  }`}>
                    {notification.title}
                  </h3>
                  <p className={`mt-1 text-sm ${
                    notification.type === 'out-of-stock' 
                      ? 'text-red-700' 
                      : 'text-yellow-700'
                  }`}>
                    {notification.message}
                  </p>
                  {notification.product && (
                    <div className="mt-2 flex items-center gap-4 text-xs">
                      <span className={
                        notification.type === 'out-of-stock' 
                          ? 'text-red-600' 
                          : 'text-yellow-600'
                      }>
                        SKU: {notification.product?.sku || 'N/A'}
                      </span>
                      <span className={
                        notification.type === 'out-of-stock' 
                          ? 'text-red-600' 
                          : 'text-yellow-600'
                      }>
                        Current Stock: {notification.product?.stock || 0} {notification.product?.unit || 'pieces'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notification;