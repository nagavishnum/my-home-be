import express from 'express';
import financebook from '../models/financebook';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateId, validateBody } from '../middleware/validate';

const router = express.Router();

const DEFAULT_LIMIT = 50;

router.get('/', asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, 200);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    financebook.find()
      .populate('c', 'n')
      .sort({ md: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    financebook.countDocuments(),
  ]);

  res.json({ data, total, page, limit });
}));

router.post(
  '/',
  validateBody([
    'n',
    'a',
    'c',
    'ty',
    'md',
  ]),
  asyncHandler(async (req, res) => {
    const {
      n,
      a,
      sv,
      c,
      ty,
      md,
      lp,
      rt,
      cv,
      no,
    } = req.body;

    const amount =
      Number(a) || 0;

    const sipValue =
      Number(sv) || 0;

    const currentValue =
      Number(cv) ||
      amount;

    const body = {
      n: String(n).trim(),

      a: amount,

      sv:
        ty === 'Monthly'
          ? sipValue
          : 0,

      c,

      ty: ty as
        | 'Monthly'
        | 'OneTime',

      md,

      lp: Number(lp) || 0,

      rt: Number(rt) || 0,

      cv: currentValue,

      no: no
        ? String(no).trim()
        : '',
    };

    const data =
      await financebook.create(
        body
      );

    const populated =
      await data.populate(
        'c',
        'n'
      );

    res
      .status(201)
      .json(populated);
  })
);

router.put(
  '/:id',

  validateId,

  validateBody([
    'n',
    'a',
    'c',
    'ty',
    'md',
  ]),

  asyncHandler(async (req, res) => {
    const {
      n,
      a,
      sv,
      c,
      ty,
      md,
      lp,
      rt,
      cv,
      no,
    } = req.body;

    const amount =
      Number(a) || 0;

    const sipValue =
      Number(sv) || 0;

    const currentValue =
      Number(cv) ||
      amount;

    const body = {
      n: String(n).trim(),

      a: amount,

      sv:
        ty === 'Monthly'
          ? sipValue
          : 0,

      c,

      ty: ty as
        | 'Monthly'
        | 'OneTime',

      md,

      lp: Number(lp) || 0,

      rt: Number(rt) || 0,

      cv: currentValue,

      no: no
        ? String(no).trim()
        : '',
    };

    const updated =
      await financebook
        .findByIdAndUpdate(
          req.params.id,
          body,
          {
            new: true,
            runValidators: true,
          }
        )
        .populate('c', 'n');

    if (!updated) {
      res.status(404).json({
        error: 'Not found',
      });

      return;
    }

    res.json(updated);
  })
);
router.delete('/:id', validateId, asyncHandler(async (req, res) => {
  const result = await financebook.findByIdAndDelete(req.params.id);
  if (!result) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ok: true });
}));

export default router;