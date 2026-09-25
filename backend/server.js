require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/db');
const seedDatabase = require('./utils/seed');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;

// Enable CORS for frontend requests (local and production)
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root health API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'EarthScape Climate Agency - Backend & Big Data Processing API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount Core API
app.use('/api', apiRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server after DB initialization
async function startServer() {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` EarthScape Climate Agency Backend API Online! `);
    console.log(` Server URL: http://localhost:${PORT}`);
    console.log(` REST API Base: http://localhost:${PORT}/api`);
    console.log(`=======================================================`);
  });
}

startServer();
