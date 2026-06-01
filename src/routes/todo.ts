import express from 'express';
import todo from '../models/todo';
import { asyncHandler } from '../middleware/asyncHandler';
import { validateId, validateBody } from '../middleware/validate';
import dailytodo from '../models/dailytodo';

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
  const { t, da, p } = req.body;
  const data = await todo.create({
    t: String(t).trim(),
    da,
    p: p as 'low' | 'medium' | 'high' | 'mandatory',
  });
  res.status(201).json(data);
}));

router.put('/:id', validateId, asyncHandler(async (req, res) => {
  const allowed: Partial<{
    t: string;
    da: Date;
    p: 'low' | 'medium' | 'high' | 'mandatory';
  }> = {};

  if (req.body.t !== undefined) {
    allowed.t = String(req.body.t).trim();
  }

  if (req.body.da !== undefined) {
    allowed.da = req.body.da;
  }

  if (req.body.p !== undefined) {
    allowed.p = req.body.p;
  }

  const data = await todo.findByIdAndUpdate(
    req.params.id,
    allowed,
    { new: true }
  ).lean();

  if (!data) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  res.json(data);
}));

router.delete('/:id', validateId, asyncHandler(async (req, res) => {
  const result = await todo.findByIdAndDelete(req.params.id);
  if (!result) { res.status(404).json({ error: 'Not found' }); return; }
  res.json({ ok: true });
}));

router.get("/dailytodo", async (req, res) => {
    try {
        const todos = await dailytodo.find().sort({ _id: -1 });

        res.status(200).json(todos);
    } catch (err) {
        res.status(500).json({
            message: "Failed to fetch todos"
        });
    }
});
router.post("/dailytodo", async (req, res) => {
    try {
        const { t } = req.body;

        const todo = await dailytodo.create({
            t,
          
        });

        res.status(201).json(todo);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Failed to create daily todo",
        });
    }
});
router.put("/dailytodo/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { t } = req.body;

        const updatedTodo =
            await dailytodo.findByIdAndUpdate(
                id,
                {
                    t,
                },
                {
                    new: true,
                }
            );

        if (!updatedTodo) {
            return res.status(404).json({
                message: "Todo not found",
            });
        }

        res.status(200).json(updatedTodo);
    } catch (err) {
        res.status(500).json({
            message: "Failed to update todo",
        });
    }
});
router.delete("/dailytodo/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await dailytodo.findByIdAndDelete(id);

    if (!deletedTodo) {
      return res.status(404).json({
        message: "Todo not found",
      });
    }

    res.status(200).json({
      message: "Todo deleted successfully",
      deletedTodo,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete todo",
    });
  }
});
export default router;