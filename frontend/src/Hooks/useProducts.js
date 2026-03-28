import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { productAPI } from '../api/product.api'

export const productKeys = {
  all: ['products'],
  list: (params) => ['products', 'list', params],
  detail: (id) => ['products', 'detail', id],
  search: (query) => ['products', 'search', query],
  lowStock: ['products', 'low-stock'],
}

const getListPayload = (response) => response?.data?.data ?? { products: [], pagination: null }
const getProductPayload = (response) => response?.data?.data?.product ?? null
const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback

export const useProducts = (params = {}) => {
  const query = useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => productAPI.getAll(params),
    select: getListPayload,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  })

  return {
    ...query,
    data: query.data ?? { products: [], pagination: null },
    products: query.data?.products ?? [],
    loading: query.isLoading,
    fetchProducts: query.refetch,
  }
}

export const useInfiniteProducts = (params = {}) => {
  return useInfiniteQuery({
    queryKey: productKeys.list({ ...params, infinite: true }),
    queryFn: ({ pageParam = 1 }) =>
      productAPI.getAll({ ...params, page: pageParam, limit: 20 }),
    initialPageParam: 1,
    select: (data) => ({
      ...data,
      pages: data.pages.map(getListPayload),
    }),
    getNextPageParam: (lastPage) =>
      lastPage?.pagination?.page < lastPage?.pagination?.pages
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 30_000,
  })
}

export const useProduct = (id) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productAPI.getById(id),
    select: getProductPayload,
    enabled: !!id,
    staleTime: 60_000,
  })
}

export const useProductSearch = (query) => {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => productAPI.search(query),
    select: getListPayload,
    enabled: query?.trim().length >= 2,
    staleTime: 15_000,
  })
}

export const useLowStockProducts = () => {
  return useQuery({
    queryKey: productKeys.lowStock,
    queryFn: productAPI.getLowStock,
    select: getListPayload,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productAPI.create,
    mutationKey: ['createProduct'],
    retry: (failureCount, error) => {
      // Don't retry on conflict errors (409) or validation errors (400)
      if (error?.response?.status === 409 || error?.response?.status === 400) {
        return false
      }
      return failureCount < 2
    },
    onSuccess: (response) => {
      const newProduct = getProductPayload(response)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success(`${newProduct?.name || 'Product'} added successfully`)
    },
    onError: (error) => {
      const errorMessage = getErrorMessage(error, 'Failed to add product')
      if (error?.response?.status === 409) {
        // Extract SKU from error message if available
        const skuMatch = errorMessage.match(/SKU '([^']+)'/)
        const sku = skuMatch ? skuMatch[1] : 'entered'
        toast.error(`SKU Conflict: Product with SKU '${sku}' already exists. Please use a different SKU.`)
      } else {
        toast.error(errorMessage)
      }
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => productAPI.update(id, data),
    onSuccess: (response) => {
      const updatedProduct = getProductPayload(response)
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      if (updatedProduct?._id) {
        queryClient.invalidateQueries({ queryKey: productKeys.detail(updatedProduct._id) })
      }
      toast.success(`${updatedProduct?.name || 'Product'} updated`)
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Update failed')),
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product deleted')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Delete failed')),
  })
}

export const useDeactivateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productAPI.deactivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success('Product deactivated')
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Deactivation failed')),
  })
}

export const useBulkImportProducts = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: productAPI.bulkImport,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      toast.success(
        `Imported: ${result.upsertedCount} new, ${result.modifiedCount} updated`
      )
    },
    onError: (error) => toast.error(getErrorMessage(error, 'Import failed')),
  })
}
