import api from './axios';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export const notificationAPI = {
  getAll: () =>
    api.get(API_ENDPOINTS.NOTIFICATIONS.BASE),

  markAsRead: (id) =>
    api.patch(API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ(id)),

  markAllAsRead: () =>
    api.patch(`${API_ENDPOINTS.NOTIFICATIONS.BASE}/read-all`),
};
