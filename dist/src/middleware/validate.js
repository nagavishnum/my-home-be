"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = exports.validateId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const validateId = (req, res, next) => {
    if (!mongoose_1.default.isValidObjectId(req.params.id)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    next();
};
exports.validateId = validateId;
const validateBody = (requiredFields) => (req, res, next) => {
    const missing = requiredFields.filter((f) => {
        const val = req.body[f];
        return val === undefined || val === null || val === '';
    });
    if (missing.length) {
        res.status(400).json({ error: `Missing fields: ${missing.join(', ')}` });
        return;
    }
    next();
};
exports.validateBody = validateBody;
