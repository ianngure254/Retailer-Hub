import { useState } from 'react'
import { useProducts } from '../Hooks/useProducts'
import { useCreateSale } from '../Hooks/useSales'
import toast from 'react-hot-toast'

const QTY_PRESETS = [0.25, 0.5, 1, 2]
const PAY_METHODS = ['Cash', 'Mobile', 'Bank', 'Credit']

export default function ProductPOSGrid() {
  const { products } = useProducts()
  const { mutate: createSale, isPending } = useCreateSale()
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState('')        // ✅ empty string, not 0
  const [payMethod, setPayMethod] = useState('Cash')
  const [activePreset, setActivePreset] = useState(null)

  const parsedQty = parseFloat(qty) || 0
  const total = selected && parsedQty > 0 ? selected.price * parsedQty : 0

  const handleSelect = (product) => {
    setSelected(product)
    setQty('')                              // ✅ clears input visually
    setActivePreset(null)
  }

  const handlePreset = (v) => {
    setQty(String(v))                       // ✅ controlled — syncs input display
    setActivePreset(v)
  }

  const handleCustomQty = (e) => {
    setQty(e.target.value)
    setActivePreset(null)
  }

  const handleComplete = () => {
    if (!selected || parsedQty <= 0) {
      toast.error('Please select a product and enter quantity')
      return
    }

    // ✅ Stock guard
    if (parsedQty > selected.stock) {
      toast.error(`Only ${selected.stock} ${selected.unit} available`)
      return
    }

    const saleData = {
      items: [{
        productId: selected._id,
        quantity: parsedQty,
        unitPrice: parseFloat(selected.price)
      }],
      paymentMethod: payMethod
    }

    createSale(saleData, {
      onSuccess: () => {
        setSelected(null)
        setQty('')
        setActivePreset(null)
      }
      // ✅ No toast here — hook handles it
    })
  }

  return (
    <div className="space-y-4">
      {/* Product Grid */}
      <div className="grid grid-cols-4 gap-3">
        {products.map(p => (
          <button key={p._id} onClick={() => handleSelect(p)}
            className={`text-left p-4 rounded-xl border-2 transition-all
              ${selected?._id === p._id
                ? 'border-orange-400 bg-orange-50'
                : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <div className="text-3xl mb-2">{p.icon || '📦'}</div>
            <p className="font-medium text-sm text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-400">KSh {p.price.toFixed(2)} / {p.unit}</p>
            <p className="text-xs text-gray-400">{p.stock.toFixed(2)} {p.unit} left</p>
          </button>
        ))}
      </div>

      {/* Bottom Panel */}
      <div className="grid grid-cols-3 gap-3">
        {/* Quantity */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Quantity</p>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {QTY_PRESETS.map(v => (
              <button key={v} onClick={() => handlePreset(v)}
                className={`py-2 rounded-lg border text-sm font-medium transition-all
                  ${activePreset === v
                    ? 'border-orange-400 bg-orange-50 text-orange-600'
                    : 'border-gray-200 text-gray-700 hover:border-orange-300'}`}>
                {v}
              </button>
            ))}
          </div>
          {/* ✅ Controlled input — value tied to state */}
          <input
            type="number"
            min="0"
            step="0.25"
            placeholder="Custom qty"
            value={qty}
            onChange={handleCustomQty}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-orange-400"
          />
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Payment Method</p>
          <div className="grid grid-cols-2 gap-2">
            {PAY_METHODS.map(m => (
              <button key={m} onClick={() => setPayMethod(m)}
                className={`py-2 rounded-lg text-sm font-medium transition-all border
                  ${payMethod === m
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'border-gray-200 text-gray-700 hover:border-orange-300'}`}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Sale Summary */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Sale Summary</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Item</span>
                <span className="font-medium">{selected?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Qty</span>
                <span className="font-medium">
                  {parsedQty > 0 ? `${parsedQty} ${selected?.unit || 'pcs'}` : '0'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment</span>
                <span className="font-medium">{payMethod}</span>
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
              <span className="font-medium">Total</span>
              <span className="text-xl font-semibold text-orange-500">KSh {total.toFixed(2)}</span>
            </div>
            {!selected && (
              <p className="text-xs text-amber-600 mt-2">⚠️ Select a product to continue</p>
            )}
            {selected && parsedQty <= 0 && (
              <p className="text-xs text-amber-600 mt-2">⚠️ Enter quantity to continue</p>
            )}
          </div>
          <button
            onClick={handleComplete}
            disabled={!selected || parsedQty <= 0 || isPending}
            className="mt-4 w-full py-3 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
            {isPending ? 'Posting...' : '🛒 Complete Sale'}
          </button>
        </div>
      </div>
    </div>
  )
}