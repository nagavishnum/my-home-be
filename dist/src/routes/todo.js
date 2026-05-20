import express from 'express';
import todo from '../models/todo';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateId, validateBody } from '../middleware/validate';
const router = express.Router();
const DEFAULT_LIMIT = 50;
router.get('/', asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, 200);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        todo.find()
            .sort({ da: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        todo.countDocuments(),
    ]);
    res.json({ data, total, page, limit });
}));
router.post('/', validateBody(['t', 'da', 'p']), asyncHandler(async (req, res) => {
    const { t, ti, da, p, s } = req.body;
    const data = await todo.create({
        t: String(t).trim(),
        ti: ti ? String(ti) : '',
        da,
        p: p,
        s: Boolean(s) || false,
    });
    res.status(201).json(data);
}));
router.put('/:id', validateId, asyncHandler(async (req, res) => {
    const allowed = {};
    if (req.body.t !== undefined)
        allowed.t = String(req.body.t).trim();
    if (req.body.ti !== undefined)
        allowed.ti = String(req.body.ti);
    if (req.body.da !== undefined)
        allowed.da = req.body.da;
    if (req.body.p !== undefined)
        allowed.p = req.body.p;
    if (req.body.s !== undefined)
        allowed.s = Boolean(req.body.s);
    const data = await todo.findByIdAndUpdate(req.params.id, allowed, { new: true }).lean();
    if (!data) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(data);
}));
router.delete('/:id', validateId, asyncHandler(async (req, res) => {
    const result = await todo.findByIdAndDelete(req.params.id);
    if (!result) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json({ ok: true });
}));
export default router;
