"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const expensesSchema = new mongoose_1.default.Schema({
    a: { type: Number, required: true },
    r: { type: String, required: true, trim: true },
    c: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Category', required: true },
    d: { type: Date, required: true, index: true }
}, { timestamps: false, versionKey: false });
expensesSchema.index({ d: -1 });
exports.default = mongoose_1.default.model('Expense', expensesSchema);
