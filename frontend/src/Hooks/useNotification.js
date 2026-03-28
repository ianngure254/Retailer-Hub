import { useQuery } from '@tanstack/react-query';
import { notificationAPI } from '../api/notification.api';

export const useNotification = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
