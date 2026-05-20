import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './src/config/db';
import { errorHandler } from './src/middleware/errorHandler';
import expenseRoutes from './src/routes/expenses';
import financeRoutes from './src/routes/financebook';
import todoRoutes from './src/routes/todo';
import categoryRoutes from './src/routes/categories';
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
    app.use('/expenses', expenseRoutes);
    app.use('/finance', financeRoutes);
    app.use('/todos', todoRoutes);
    app.use('/categories', categoryRoutes);
    app.use(errorHandler);
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
});
