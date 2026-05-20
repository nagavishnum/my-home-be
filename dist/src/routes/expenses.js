"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const expenses_1 = __importDefault(require("../models/expenses"));
const asyncHandler_1 = require("../middleware/asyncHandler");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
const DEFAULT_LIMIT = 50;
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, 200);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        expenses_1.default.find()
            .populate('c', 'n')
            .sort({ d: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        expenses_1.default.countDocuments(),
    ]);
    res.json({ data, total, page, limit });
}));
router.post('/', (0, validate_1.validateBody)(['a', 'r', 'c', 'd']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { a, r, c, d } = req.body;
    const data = await expenses_1.default.create({ a: Number(a), r: String(r).trim(), c, d });
    const populated = await data.populate('c', 'n');
    res.status(201).json(populated);
}));
router.delete('/:id', validate_1.validateId, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await expenses_1.default.findByIdAndDelete(req.params.id);
    if (!result) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json({ ok: true });
}));
exports.default = router;
