import mongoose from "mongoose";

const expensesSchema = new mongoose.Schema(
    {
        a: { type: Number, required: true },
        c: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
        d: { type: Date, required: true, index: true }
    },
    { timestamps: false, versionKey: false }
);

expensesSchema.index({ d: -1 });

export default mongoose.model('Expense', expensesSchema);