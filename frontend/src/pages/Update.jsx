import { useEffect, useState } from 'react'
import { Minus, PackagePlus, Plus, Save, Search, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import { useCreateProduct, useDeleteProduct, useProducts, useUpdateProduct } from '../Hooks/useProducts'
import { formatCurrency } from '../utils/formatCurrency'

export default function UpdateProducts() {
  const { products, loading, fetchProducts } = useProducts()
  const { mutateAsync: updateProduct } = useUpdateProduct()
  const { mutateAsync: addProduct } = useCreateProduct()
  const { mutateAsync: deleteProduct } = useDeleteProduct()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleSaveProduct = async (localProduct) => {
    try {
      await updateProduct({
        id: localProduct._id,
        data: {
          price: localProduct.price,
          stock: localProduct.stock,
        },
      })
      // No need to manually refetch - React Query handles cache invalidation
      return true
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update product')
      return false
    }
  }

  const handleAddProduct = async (newProduct) => {
    try {
      await addProduct(newProduct)
      setShowAddModal(false)
      return true
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to add product')
      return false
    }
  }

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId)
      setDeleteConfirm(null)
      return true
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete product')
      return false
    }
  }

  const normalizedSearch = searchQuery.toLowerCase()
  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(normalizedSearch) ||
    product.sku?.toLowerCase().includes(normalizedSearch)
  )

  if (loading) return <Loading />

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Update Products</h1>
          <p className="text-gray-600 mt-1">Update prices, quantities, and add new products</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <PackagePlus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProducts.map((product) => (
          <ProductUpdateCard
            key={product._id}
            product={product}
            onSave={handleSaveProduct}
            onDelete={handleDeleteProduct}
            deleteConfirm={deleteConfirm}
            setDeleteConfirm={setDeleteConfirm}
          />
        ))}
      </div>

      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddProduct}
        />
      )}
    </div>
  )
}

function ProductUpdateCard({ product, onSave, onDelete, deleteConfirm, setDeleteConfirm }) {
  const [localProduct, setLocalProduct] = useState(product)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLocalProduct(product)
  }, [product])

  const handleSave = async () => {
    setSaving(true)
    const success = await onSave(localProduct)
    if (success) {
      // Reset localProduct to match the original product data
      setLocalProduct(product)
    }
    setSaving(false)
  }

  const hasChanges =
    parseFloat(localProduct.price) !== parseFloat(product.price) ||
    parseInt(localProduct.stock) !== parseInt(product.stock)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          </div>
          <button
            onClick={() => setDeleteConfirm(product._id)}
            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            title="Delete Product"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Price (KSh)
          </label>
          <input
            type="number"
            value={localProduct.price}
            onChange={(e) => setLocalProduct({ ...localProduct, price: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.01"
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Quantity
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocalProduct({ ...localProduct, stock: Math.max(0, localProduct.stock - 1) })}
              className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </button>

            <input
              type="number"
              value={localProduct.stock}
              onChange={(e) => setLocalProduct({ ...localProduct, stock: parseInt(e.target.value) || 0 })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center w-24"
              min="0"
            />

            <button
              onClick={() => setLocalProduct({ ...localProduct, stock: localProduct.stock + 1 })}
              className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>

            <div className="flex-1 text-right">
              <p className="text-sm text-gray-600">Current Stock</p>
              <p className="text-xl font-bold text-gray-900">{product.stock}</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Value:</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(localProduct.price * localProduct.stock)}
            </span>
          </div>
        </div>

        {hasChanges && (
          <Button
            onClick={handleSave}
            loading={saving}
            className="w-full flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </Button>
        )}

        {deleteConfirm === product._id && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete "{product.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => onDelete(product._id)}
                  variant="danger"
                  className="flex-1"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  variant="secondary"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function AddProductModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skuError, setSkuError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    lowStockThreshold: 10,
    unit: 'piece',
  })

  // Validate SKU format and uniqueness
  const validateSKU = async (sku) => {
    if (!sku) {
      setSkuError('')
      return true
    }
    
    // Basic SKU format validation
    const skuRegex = /^[A-Z0-9-]+$/i
    if (!skuRegex.test(sku)) {
      setSkuError('SKU can only contain letters, numbers, and hyphens')
      return false
    }
    
    // Check SKU uniqueness in real-time (debounced)
    try {
      const response = await fetch(`http://localhost:3000/api/products?search=${encodeURIComponent(sku)}`)
      const data = await response.json()
      
      if (data.success && data.data?.products?.length > 0) {
        const existingProduct = data.data.products.find(p => p.sku.toUpperCase() === sku.toUpperCase())
        if (existingProduct) {
          setSkuError(`SKU '${sku}' already exists. Product: ${existingProduct.name}`)
          return false
        }
      }
    } catch (error) {
      // Don't show error for validation check failures
      console.log('SKU validation check failed:', error)
    }
    
    setSkuError('')
    return true
  }

  // Debounced SKU validation
  const [debouncedSku, setDebouncedSku] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSku) {
        validateSKU(debouncedSku)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [debouncedSku])

  const handleSKUChange = async (e) => {
    const newSKU = e.target.value.toUpperCase()
    setFormData({ ...formData, sku: newSKU })
    setDebouncedSku(newSKU)
    
    // Immediate format validation
    const skuRegex = /^[A-Z0-9-]*$/i
    if (!skuRegex.test(newSKU)) {
      setSkuError('SKU can only contain letters, numbers, and hyphens')
    } else {
      setSkuError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting || loading) {
      e.preventDefault()
      return
    }

    if (!formData.name || !formData.sku || !formData.price || !formData.stock) {
      toast.error('Please fill in all required fields')
      return
    }

    // Validate SKU before submission
    const isValidSKU = await validateSKU(formData.sku)
    if (!isValidSKU || skuError) {
      toast.error('Please fix SKU validation errors')
      return
    }

    try {
      setIsSubmitting(true)
      setLoading(true)

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
      }

      const success = await onSuccess(productData)
      if (success) {
        setFormData({
          name: '',
          sku: '',
          description: '',
          category: '',
          price: '',
          stock: '',
          lowStockThreshold: 10,
          unit: 'piece',
        })
        setSkuError('')
      }
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU *
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={handleSKUChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    skuError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {skuError && (
                  <p className="mt-1 text-sm text-red-600">{skuError}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter category (e.g., Electronics, Clothing, Food)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="piece">Piece</option>
                  <option value="kg">Kilogram</option>
                  <option value="liter">Liter</option>
                  <option value="box">Box</option>
                  <option value="pack">Pack</option>
                  <option value="meter">Meter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (KSh) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Stock *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" loading={loading || isSubmitting} disabled={isSubmitting || loading} className="flex-1">
                Add Product
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

//Add form Submission (prevention)..
