import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import './index.css'

// Pages

import Products from './pages/Product.jsx'
import Update from './pages/Update.jsx'
import Report from './pages/Report.jsx'
import Notification from './pages/Notification.jsx'



// Components
import Navbar from './components/Navbar.jsx'







// Separate Layout component
function Layout() {
  return (
    <div className="flex">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}


//Router paths - all routes under Layout with no auth needed
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Products /> },

      { path: "products", element: <Products /> },
      { path: "updateproducts", element: <Update /> },
      { path: "reports", element: <Report /> },
      { path: "notification", element: <Notification /> },

    ]
  }
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
