import express from 'express';
import financebook from '../models/financebook';
import {
  asyncHandler,
} from '../middleware/asyncHandler';
import {
  validateId,
  validateBody,
} from '../middleware/validate';

import {
  buildFinancePayload,
  updateCurrentFinanceSnapshot,
} from '../services/financeSnapshotService';

const router = express.Router();

const DEFAULT_LIMIT = 50;

/**
 * GET /finance
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = Math.max(
      Number(req.query.page) || 1,
      1,
    );

    const limit = Math.min(
      Number(req.query.limit) ||
        DEFAULT_LIMIT,
      200,
    );

    const skip =
      (page - 1) * limit;

    const [data, total] =
      await Promise.all([
        financebook
          .find()
          .populate('c', 'n')
          .sort({ md: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        financebook.countDocuments(),
      ]);

    res.json({
      data,
      total,
      page,
      limit,
    });
  }),
);

/**
 * POST /finance
 */
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
    const body =
      buildFinancePayload(
        req.body,
      );

    const data =
      await financebook.create(
        body,
      );

    /*
     * Finance has changed.
     * Rebuild the current month's snapshot.
     */
    await updateCurrentFinanceSnapshot();

    const populated =
      await data.populate(
        'c',
        'n',
      );

    res
      .status(201)
      .json(populated);
  }),
);

/**
 * PUT /finance/:id
 */
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
    const body =
      buildFinancePayload(
        req.body,
      );

    const updated =
      await financebook
        .findByIdAndUpdate(
          req.params.id,
          body,
          {
            new: true,
            runValidators: true,
          },
        )
        .populate(
          'c',
          'n',
        );

    if (!updated) {
      res.status(404).json({
        error: 'Not found',
      });

      return;
    }

    /*
     * Finance has changed.
     * Rebuild the current month's snapshot.
     */
    await updateCurrentFinanceSnapshot();

    res.json(updated);
  }),
);

/**
 * DELETE /finance/:id
 */
router.delete(
  '/:id',

  validateId,

  asyncHandler(async (req, res) => {
    const result =
      await financebook.findByIdAndDelete(
        req.params.id,
      );

    if (!result) {
      res.status(404).json({
        error: 'Not found',
      });

      return;
    }

    /*
     * Finance has changed.
     * Rebuild the current month's snapshot.
     */
    await updateCurrentFinanceSnapshot();

    res.json({
      ok: true,
    });
  }),
);

export default router;