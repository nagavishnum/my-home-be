"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const todoSchema = new mongoose_1.default.Schema({
    t: { type: String, required: true, trim: true },
    ti: { type: String, default: '' },
    da: { type: Date, required: true, index: true },
    p: { type: String, required: true, enum: ['low', 'medium', 'high', 'mandatory'], default: 'medium' },
    s: { type: Boolean, default: false }
}, { timestamps: true, versionKey: false });
todoSchema.index({ da: -1 });
todoSchema.index({ s: 1 });
exports.default = mongoose_1.default.model('Todo', todoSchema);
