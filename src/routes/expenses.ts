import express from 'express';
import expenses from '../models/expenses';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateId, validateBody } from '../middleware/validate';
import expensesummary from '../models/expensesummary';

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

router.post(
  '/compress',
  asyncHandler(async (req, res) => {
try{

    const rawExpenses =
      await expenses.find().lean();

    if (!rawExpenses.length) {

      res.json({
        ok: true,
        message: 'No expenses to compress'
      });

      return;
    }

    // grouped monthly data
    const monthlyMap =
      new Map();

    for (const item of rawExpenses) {

      const date =
        new Date(item.d);

      const y =
        date.getFullYear();

      const m =
        date.getMonth() + 1;

      const monthKey =
        `${y}-${m}`;

      if (!monthlyMap.has(monthKey)) {

        monthlyMap.set(
          monthKey,
          {
            y,
            m,
            t: 0,
            c: new Map()
          }
        );
      }

      const existingMonth =
        monthlyMap.get(monthKey);

      existingMonth.t += item.a;

      const categoryKey =
        String(item.c);

      const existingAmount =
        existingMonth.c.get(categoryKey) || 0;

      existingMonth.c.set(
        categoryKey,
        existingAmount + item.a
      );
    }

    // save summaries
    for (const monthData of monthlyMap.values()) {

      const existingSummary =
        await expensesummary.findOne({

          y: monthData.y,

          m: monthData.m
        });

      // existing category totals
      const mergedCategories =
        new Map();

      let grandTotal = 0;

      // old compressed data
      if (existingSummary) {

        grandTotal +=
          existingSummary.t;

        for (const item of existingSummary.c) {

          mergedCategories.set(
            String(item._id),
            item.a
          );
        }
      }

      // new compression data
      grandTotal +=
        monthData.t;

      for (
        const [categoryId, amount]
        of monthData.c.entries()
      ) {

        const oldAmount =
          mergedCategories.get(categoryId) || 0;

        mergedCategories.set(
          categoryId,
          oldAmount + amount
        );
      }

      const finalCategories =
        Array.from(
          mergedCategories.entries()
        ).map(([key, value]) => ({

          _id: key,

          a: value
        }));

      await expensesummary.findOneAndUpdate(

        {
          y: monthData.y,
          m: monthData.m
        },

        {
          $set: {

            y: monthData.y,

            m: monthData.m,

            t: grandTotal,

            c: finalCategories
          }
        },

        {
          upsert: true,
          new: true
        }
      );
    }

    // delete compressed raw expenses
    const ids =
      rawExpenses.map(item => item._id);

    const deleted =
      await expenses.deleteMany({

        _id: {
          $in: ids
        }
      });

    res.json({

      ok: true,

      compressed:
        rawExpenses.length,

      deleted:
        deleted.deletedCount
    });
  }catch(e){
    console.log(e,"err")
  }
  })

);

router.get(
  '/yearly-summary',
  asyncHandler(async (req, res) => {
    const year = Number(req.query.year);

    if (!year || !Number.isInteger(year)) {
      res.status(400).json({
        error: 'Valid year is required'
      });
      return;
    }

    const summaries = await expensesummary
      .find({ y: year })
      .populate('c._id', 'n')
      .sort({ m: 1 })
      .lean();

    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    const months = summaries.map(summary => ({
      m: monthNames[summary.m - 1],
      t: summary.t,
      c: summary.c.map(category => ({
        n: (category._id as any)?.n,
        a: category.a
      }))
    }));

    res.json({
      year,
      months
    });
  })
);
export default router;
