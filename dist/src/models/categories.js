"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const categorySchema = new mongoose_1.default.Schema({
    n: { type: String, required: true, trim: true },
    t: { type: String, required: true, enum: ['expense', 'finance', 'todo'] }
}, { timestamps: false, versionKey: false });
categorySchema.index({ t: 1 });
exports.default = mongoose_1.default.model('Category', categorySchema);
