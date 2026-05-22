import express from 'express';
import Goal from '../models/goals';
import {
  asyncHandler
} from '../middleware/asyncHandler';

import {
  validateBody,
  validateId
} from '../middleware/validate';

const router = express.Router();

const DEFAULT_LIMIT = 50;

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Number(req.query.limit) ||
        DEFAULT_LIMIT,
      200
    );

    const skip = (page - 1) * limit;

    const [data, total] =
      await Promise.all([
        Goal.find()
          .populate('c', 'n')
          .sort({ td: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        Goal.countDocuments(),
      ]);

    res.json({
      data,
      total,
      page,
      limit,
    });
  })
);

router.post(
  '/',
  validateBody([
    't',
    'c',
    'td',
  ]),
  asyncHandler(async (req, res) => {
    const {
      t,
      d,
      c,
      td,
      p,
      s,
      tv,
      cv,
    } = req.body;

    const data = await Goal.create({
      t: String(t).trim(),
      d: d
        ? String(d).trim()
        : '',
      c,
      td,
      p,
      s,
      tv: Number(tv) || 0,
      cv: Number(cv) || 0,
    });

    const populated =
      await data.populate('c', 'n');

    res.status(201).json(populated);
  })
);

router.put(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const {
      t,
      d,
      c,
      td,
      p,
      s,
      tv,
      cv,
    } = req.body;

    const updated =
      await Goal.findByIdAndUpdate(
        req.params.id,
        {
          t: String(t).trim(),
          d: d
            ? String(d).trim()
            : '',
          c,
          td,
          p,
          s,
          tv: Number(tv) || 0,
          cv: Number(cv) || 0,
        },
        { new: true }
      ).populate('c', 'n');

    if (!updated) {
      res
        .status(404)
        .json({
          error: 'Not found',
        });

      return;
    }

    res.json(updated);
  })
);

router.delete(
  '/:id',
  validateId,
  asyncHandler(async (req, res) => {
    const result =
      await Goal.findByIdAndDelete(
        req.params.id
      );

    if (!result) {
      res
        .status(404)
        .json({
          error: 'Not found',
        });

      return;
    }

    res.json({ ok: true });
  })
);

export default router;