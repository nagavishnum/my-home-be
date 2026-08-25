import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { connectDB } from './src/config/db';
import { errorHandler } from './src/middleware/errorHandler';

import expenseRoutes from './src/routes/expenses';
import financeRoutes from './src/routes/financebook';
import financeSnapshotRouter from './src/routes/financeSnapshot';
import todoRoutes from './src/routes/todo';
import categoryRoutes from './src/routes/categories';
import authRoutes from './src/routes/auth';
import goalRoutes from './src/routes/goals';
import { auth } from './src/middleware/auth';

if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is required');
  process.exit(1);
}

const PORT = Number(process.env.PORT) || 5000;

const app = express();

app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://my-home-ui.vercel.app",
    "https://my-home-sepia-zeta.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

connectDB()
  .then(() => {

    // PUBLIC
    app.use('/auth', authRoutes);

    // PRIVATE
    app.use('/expenses', auth, expenseRoutes);
    app.use('/finance', auth, financeRoutes);
    app.use('/todos', auth, todoRoutes);
    app.use('/categories', auth, categoryRoutes);
    app.use('/goal', auth, goalRoutes);
app.use(
  '/finance-snapshots',
  financeSnapshotRouter,
);
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  });