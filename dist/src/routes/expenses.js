import express from 'express';
import expenses from '../models/expenses';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateId, validateBody } from '../middleware/validate';
const router = express.Router();
const DEFAULT_LIMIT = 50;
router.get('/', asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, 200);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        expenses.find()
            .populate('c', 'n')
            .sort({ d: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        expenses.countDocuments(),
    ]);
    res.json({ data, total, page, limit });
}));
router.post('/', validateBody(['a', 'r', 'c', 'd']), asyncHandler(async (req, res) => {
    const { a, r, c, d } = req.body;
    const data = await expenses.create({ a: Number(a), r: String(r).trim(), c, d });
    const populated = await data.populate('c', 'n');
    res.status(201).json(populated);
}));
router.delete('/:id', validateId, asyncHandler(async (req, res) => {
    const result = await expenses.findByIdAndDelete(req.params.id);
    if (!result) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json({ ok: true });
}));
export default router;
