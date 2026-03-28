import api from './axios';
import { API_ENDPOINTS } from '../constants/api-endpoints';

export const getDailyReport = async (date) => {
  const { data } = await api.get(API_ENDPOINTS.REPORTS.DAILY, { params: { date } });

  return data.data;
};