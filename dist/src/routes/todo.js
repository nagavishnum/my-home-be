"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const todo_1 = __importDefault(require("../models/todo"));
const asyncHandler_1 = require("../middleware/asyncHandler");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
const DEFAULT_LIMIT = 50;
router.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || DEFAULT_LIMIT, 200);
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        todo_1.default.find()
            .sort({ da: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        todo_1.default.countDocuments(),
    ]);
    res.json({ data, total, page, limit });
}));
router.post('/', (0, validate_1.validateBody)(['t', 'da', 'p']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { t, ti, da, p, s } = req.body;
    const data = await todo_1.default.create({
        t: String(t).trim(),
        ti: ti ? String(ti) : '',
        da,
        p: p,
        s: Boolean(s) || false,
    });
    res.status(201).json(data);
}));
router.put('/:id', validate_1.validateId, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
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
    const data = await todo_1.default.findByIdAndUpdate(req.params.id, allowed, { new: true }).lean();
    if (!data) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(data);
}));
router.delete('/:id', validate_1.validateId, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await todo_1.default.findByIdAndDelete(req.params.id);
    if (!result) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json({ ok: true });
}));
exports.default = router;
