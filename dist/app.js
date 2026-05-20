"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const db_1 = require("./src/config/db");
const errorHandler_1 = require("./src/middleware/errorHandler");
const expenses_1 = __importDefault(require("./src/routes/expenses"));
const financebook_1 = __importDefault(require("./src/routes/financebook"));
const todo_1 = __importDefault(require("./src/routes/todo"));
const categories_1 = __importDefault(require("./src/routes/categories"));
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is required');
    process.exit(1);
}
const PORT = Number(process.env.PORT) || 5000;
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "https://my-home-ui.vercel.app",
        "https://my-home-sepia-zeta.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express_1.default.json({ limit: '1mb' }));
(0, db_1.connectDB)()
    .then(() => {
    app.use('/expenses', expenses_1.default);
    app.use('/finance', financebook_1.default);
    app.use('/todos', todo_1.default);
    app.use('/categories', categories_1.default);
    app.use(errorHandler_1.errorHandler);
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
})
    .catch((err) => {
    console.error("DB connection failed", err);
    process.exit(1);
});
