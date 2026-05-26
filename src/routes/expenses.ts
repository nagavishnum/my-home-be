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

router.post('/', validateBody(['a', 'c', 'd']), asyncHandler(async (req, res) => {
  const { a, c, d } = req.body;
  const data = await expenses.create({ a: Number(a), c, d });
  const populated = await data.populate('c', 'n');
  res.status(201).json(populated);
}));
router.put('/:id', validateId, asyncHandler(async (req, res) => {
  const { a, c, d } = req.body;

  const updated = await expenses.findByIdAndUpdate(
    req.params.id,
    {
      a: Number(a),
      c,
      d
    },
    { new: true }
  ).populate('c', 'n');

  if (!updated) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  res.json(updated);
}));

router.delete('/bulk', asyncHandler(async (req, res) => {
  const { type, value } = req.query;

  if (!type || !value) {
    res.status(400).json({ error: 'type and value required' });
    return;
  }

  let start: Date | undefined;
  let end: Date | undefined;

  const date = new Date(String(value));

  if (type === 'day') {
    start = new Date(date);
    start.setHours(0, 0, 0, 0);

    end = new Date(date);
    end.setHours(23, 59, 59, 999);
  }

  if (type === 'month') {
    start = new Date(date.getFullYear(), date.getMonth(), 1);
    end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  if (type === 'year') {
    start = new Date(date.getFullYear(), 0, 1);
    end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
  }

  if (!start || !end) {
    res.status(400).json({ error: 'Invalid type' });
    return;
  }

  const result = await expenses.deleteMany({
    d: { $gte: start, $lte: end }
  });

  res.json({
    deleted: result.deletedCount
  });
}));
router.delete('/:id', validateId, asyncHandler(async (req, res) => {
  const result = await expenses.findByIdAndDelete(req.params.id);
  if (!result) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ok: true });
}));

export default router;
