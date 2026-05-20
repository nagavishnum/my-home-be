"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const financeSchema = new mongoose_1.default.Schema({
    n: { type: String, required: true, trim: true },
    c: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Category', required: true },
    a: { type: Number, required: true },
    ty: { type: String, required: true, enum: ['Monthly', 'OneTime'] },
    md: { type: Date, required: true },
    lp: { type: Number, default: 0 },
    rt: { type: Number, default: 0 },
    cv: { type: Number, default: 0 },
    no: { type: String, trim: true, default: '' }
}, { timestamps: false, versionKey: false });
financeSchema.index({ md: -1 });
financeSchema.index({ c: 1 });
exports.default = mongoose_1.default.model('Finance', financeSchema);
