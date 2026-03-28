frontend/
│
├── src/
│   │
│   ├── api/
│   │   ├── axios.js              # Axios config
│   │   ├── product.api.js
│   │   ├── sale.api.js
│   │   ├── report.api.js
│   │   └── notification.api.js
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── SearchBar.jsx
│   │   │
│   │   ├── products/
│   │   │   ├── ProductList.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductDetails.jsx
│   │   │
│   │   ├── updateProduct/
│   │   │   ├── UpdateProductList.jsx
│   │   │   └── UpdateProductForm.jsx
│   │   │
│   │   ├── reports/
│   │   │   ├── DailyReport.jsx
│   │   │   └── ReportTable.jsx
│   │   │
│   │   └── notifications/
│   │       └── StockAlerts.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Products.jsx
│   │   ├── UpdateProducts.jsx
│   │   └── Reports.jsx
│   │
│   ├── hooks/
│   │   ├── useProducts.js
│   │   ├── useReports.js
│   │   └── useNotifications.js
│   │
│   ├── utils/
│   │   └── formatCurrency.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── tailwind.config.js
├── vite.config.js
├── package.json
└── postcss.config.js



🎯 Frontend Principles
Pages = routing

Components = reusable UI

API layer = all backend calls

Hooks = data logic

No business logic inside components