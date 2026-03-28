// import { useEffect, useState } from 'react'
// import api from '../api/axios' // your axios instance
// import Loading from '../components/common/Loading'

// const Sale = () => {
//   const [sales, setSales] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     fetchSales()
//   }, [])

//   const fetchSales = async () => {
//     try {
//       setLoading(true)
//       const res = await api.get('/sales')
//       console.log('API Response:', res.data) // Debug log
//       // API returns { success: true, data: { sales: [...] } }
//       const salesData = res.data?.data?.sales || []
//       console.log('Sales Data:', salesData) // Debug log
//       setSales(Array.isArray(salesData) ? salesData : [])
//     } catch (err) {
//       console.error('Fetch Error:', err)
//       setError('Failed to load sales')
//       setSales([])
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) return <Loading />
//   if (error) return <p className="text-red-500">{error}</p>

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-4">Sales</h1>

//       {sales.length === 0 ? (
//         <p>No sales recorded</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="w-full border">
//             <thead className="bg-gray-100">
//               <tr>
//                 <th className="p-2 border">Items</th>
//                 <th className="p-2 border">Total</th>
//                 <th className="p-2 border">Date</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sales.map((sale) => (
//                 <tr key={sale._id} className="text-center">
//                   <td className="p-2 border">{sale.items?.length || 0} items</td>
//                   <td className="p-2 border font-semibold">
//                     {sale.totalAmount?.toFixed(2)}
//                   </td>
//                   <td className="p-2 border">
//                     {new Date(sale.createdAt).toLocaleDateString()}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   )
// }

// export default Sale
