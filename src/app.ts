import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import { requestLogger } from "./utils/logger";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
import { rateLimiter } from "./middlewares/rateLimiter";

const app = express();

// Security middleware
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://localhost:8081', // Expo mobile
    'http://localhost:8082', // Expo mobile alternative
    'http://192.168.1.34:8081', // Mobile device
    'http://192.168.1.34:8082', // Mobile device alternative
    'https://products-4-2lgc.onrender.com', // Production backend (for testing)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use(requestLogger);

// Rate limiting
app.use(rateLimiter(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Body parsing
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));

// Health check
app.get("/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API health check
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API info
app.get("/", (_req, res) => {
  res.json({ 
    name: "Micro Marketplace API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: "/api/auth",
      products: "/api/products",
    }
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

export { app };
