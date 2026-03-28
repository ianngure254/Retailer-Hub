import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productAPI } from '../api/product.api'
import toast from 'react-hot-toast'

export const salesKeys = {
  all: ['sales'],
  list: (params) => ['sales', 'list', params],
}

const getSalesPayload = (response) => response?.data?.data ?? { sales: [], pagination: null }
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const useCreateSale = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (saleData) => productAPI.createSale(saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: salesKeys.all })
      toast.success('Sale completed successfully')
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to complete sale')
    },
  })
}

export const useSales = (params = {}) => {
  const query = useQuery({
    queryKey: salesKeys.list(params),
    queryFn: () => productAPI.getSales(params),
    select: getSalesPayload,
    staleTime: 30_000,
  })

  return {
    ...query,
    data: query.data ?? { sales: [], pagination: null },
    sales: query.data?.sales ?? [],
    loading: query.isLoading,
    fetchSales: query.refetch,
  }
}
