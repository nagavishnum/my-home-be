"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categories_1 = __importDefault(require("../models/categories"));
const asyncHandler_1 = require("../middleware/asyncHandler");
const validate_1 = require("../middleware/validate");
const router = express_1.default.Router();
const VALID_TYPES = ['expense', 'finance', 'todo'];
router.get('/:cattype', (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const cattype = req.params.cattype;
    if (!VALID_TYPES.includes(cattype)) {
        res.status(400).json({ error: 'Invalid category type' });
        return;
    }
    const data = await categories_1.default.find({ t: cattype }).lean();
    res.json(data);
}));
router.post('/', (0, validate_1.validateBody)(['n', 't']), (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { n, t } = req.body;
    if (!VALID_TYPES.includes(t)) {
        res.status(400).json({ error: 'Invalid category type' });
        return;
    }
    const data = await categories_1.default.create({ n: String(n).trim(), t });
    res.status(201).json(data);
}));
router.put('/:id', validate_1.validateId, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const n = req.body.n;
    if (!n || !String(n).trim()) {
        res.status(400).json({ error: 'Name is required' });
        return;
    }
    const data = await categories_1.default.findByIdAndUpdate(req.params.id, { n: String(n).trim() }, { new: true }).lean();
    if (!data) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json(data);
}));
router.delete('/:id', validate_1.validateId, (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await categories_1.default.findByIdAndDelete(req.params.id);
    if (!result) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    res.json({ ok: true });
}));
exports.default = router;
