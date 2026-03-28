import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';


//routes....
//const authRoutes = import('./routes/authRoutes.js');   
import productRoutes from './routes/productRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import saleRoutes from './routes/saleRoutes.js';



//middleware error handler
import { errorHandler } from './middlewares/error.middleware.js';
const app = express();

//Security Middlewares

app.use(helmet());


//CORS cross-origin....
app.use(cors({
    origin: [
        'https://retailer-frontend-hub.onrender.com',
        'http://localhost:5173',
        'http://localhost:3000'

  
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

        //Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, //15 minutes
            max: 100, // limit @ to 100 request per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        app.use('/api', limiter);

        //BodyParsers..
        
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NoSQL injection sanitizer (must be AFTER body parsing)
app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (key.startsWith('$') || key.includes('.')) {
          delete obj[key];
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      });
    }
    return obj;
  };

  if (req.body) sanitize(req.body);
  next();
});

    //LOGGING
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else {
        app.use(morgan('combined'));
    }

        //Heath check...
    app.get('/health', (req, res) => {
        res.status(200).json({

    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
        });
    });     

            //API ROUTES
 //app.use('/api/auth', authRoutes);           
app.use('/api/products', productRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sales', saleRoutes);




         //Handlers(404)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

export default app;
