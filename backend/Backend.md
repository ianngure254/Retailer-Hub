backend/
│
├── src/
│   │
│   ├── config/
│   │   └── db.js                # MongoDB connection
│   │
│   ├── models/
│   │   ├── Product.js           # Product schema
│   │   └── Sale.js              # Sales schema
│   │
│   ├── controllers/
│   │   ├── product.controller.js
│   │   ├── sale.controller.js
│   │   ├── report.controller.js
│   │   └── notification.controller.js
│   │
│   ├── services/
│   │   ├── product.service.js
│   │   ├── sale.service.js
│   │   ├── report.service.js
│   │   └── notification.service.js
│   │
│   ├── routes/
│   │   ├── product.routes.js
│   │   ├── sale.routes.js
│   │   ├── report.routes.js
│   │   └── notification.routes.js
│   │
│   ├── middlewares/
│   │   ├── error.middleware.js
│   │   └── validate.middleware.js
│   │
│   ├── utils/
│   │   ├── calculateTotals.js
│   │   └── date.helper.js
│   │
│   ├── app.js                   # Express app setup
│   └── server.js                # Server entry point
│
├── .env
├── package.json
└── nodemon.json

                            
🔑 Backend Responsibilities
Controllers → handle requests

Services → business logic (important)

Models → MongoDB schemas

Routes → clean API endpoints

Utils → calculations, helpers

No logic in routes ❌

