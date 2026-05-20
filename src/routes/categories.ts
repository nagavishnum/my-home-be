import express from 'express';
import Category from '../models/categories';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateId, validateBody } from '../middleware/validate';
import { CategoryType } from '../types/common';

const router = express.Router();

const VALID_TYPES: CategoryType[] = ['expense', 'finance', 'todo'];

router.get('/:cattype', asyncHandler(async (req, res) => {
  const cattype = req.params.cattype as CategoryType;
  if (!VALID_TYPES.includes(cattype)) {
    res.status(400).json({ error: 'Invalid category type' });
    return;
  }
  const data = await Category.find({ t: cattype }).lean();
  res.json(data);
}));

router.post('/', validateBody(['n', 't']), asyncHandler(async (req, res) => {
  const { n, t } = req.body;
  if (!VALID_TYPES.includes(t)) {
    res.status(400).json({ error: 'Invalid category type' });
    return;
  }
  const data = await Category.create({ n: String(n).trim(), t });
  res.status(201).json(data);
}));

router.put('/:id', validateId, asyncHandler(async (req, res) => {
  const n = req.body.n;
  if (!n || !String(n).trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  const data = await Category.findByIdAndUpdate(
    req.params.id,
    { n: String(n).trim() },
    { new: true }
  ).lean();
  if (!data) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(data);
}));

router.delete('/:id', validateId, asyncHandler(async (req, res) => {
  const result = await Category.findByIdAndDelete(req.params.id);
  if (!result) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ok: true });
}));

export default router;