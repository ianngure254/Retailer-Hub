import api from './axios';

import { API_ENDPOINTS } from '../constants/api-endpoints';



export const productAPI = {

  getAll: (params) => api.get(API_ENDPOINTS.PRODUCTS.BASE, { params }),



  getById: (id) =>

    api.get(API_ENDPOINTS.PRODUCTS.SINGLE(id)),



  create: (data) =>

    api.post(API_ENDPOINTS.PRODUCTS.BASE, data),



  update: (id, data) =>

    api.patch(API_ENDPOINTS.PRODUCTS.SINGLE(id), data),



  delete: (id) =>

    api.delete(API_ENDPOINTS.PRODUCTS.SINGLE(id)),



  updateStock: (id, quantity) =>

    api.patch(API_ENDPOINTS.PRODUCTS.UPDATE_STOCK(id), { quantity }),



  // Missing methods added

  search: (query) => api.get(`${API_ENDPOINTS.PRODUCTS.BASE}/search`, { params: { q: query } }),



  getLowStock: () => api.get(`${API_ENDPOINTS.PRODUCTS.BASE}/low-stock`),



  deactivate: (id) => api.patch(`${API_ENDPOINTS.PRODUCTS.SINGLE(id)}/deactivate`),



  bulkImport: (data) => api.post(`${API_ENDPOINTS.PRODUCTS.BASE}/bulk-import`, data),



  // Sales methods - using correct endpoints

  createSale: (saleData) => api.post(API_ENDPOINTS.SALES.BASE, saleData),

  

  getSales: (params) => api.get(API_ENDPOINTS.SALES.BASE, { params }),



  getTodaySales: () => api.get(API_ENDPOINTS.SALES.TODAY),



  // Category methods

  getCategories: () => api.get('/categories'),

  

  getCategory: (id) => api.get(`/categories/${id}`),

  

  initializeCategories: () => api.post('/categories/initialize'),



};

