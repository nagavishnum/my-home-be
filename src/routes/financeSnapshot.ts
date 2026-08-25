import express from 'express';
import {
  asyncHandler,
} from '../middleware/asyncHandler';
import FinanceSnapshot from '../models/FinanceSnapshot';


const router = express.Router();

/**
 * GET /finance-snapshots
 *
 * Example:
 *
 * /finance-snapshots?from=202601&to=202608
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const currentPeriod =
      new Date().getFullYear() * 100 +
      (new Date().getMonth() + 1);

    const currentYear =
      Math.floor(
        currentPeriod / 100,
      );

    const from =
      Number(req.query.from) ||
      currentYear * 100 + 1;

    const to =
      Number(req.query.to) ||
      currentPeriod;

    const data =
      await FinanceSnapshot.find({
        p: {
          $gte: from,
          $lte: to,
        },
      })
        .sort({ p: 1 })
        .lean();

    res.json({
      data,
    });
  }),
);

/**
 * GET /finance-snapshots/current
 */
router.get(
  '/current',
  asyncHandler(async (_req, res) => {
    const now = new Date();

    const period =
      now.getFullYear() * 100 +
      (now.getMonth() + 1);

    const data =
      await FinanceSnapshot.findOne({
        p: period,
      }).lean();

    res.json(data);
  }),
);

export default router;