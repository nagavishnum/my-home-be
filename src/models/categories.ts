import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    n: { type: String, required: true, trim: true },
    t: { type: String, required: true, enum: ['expense', 'finance', 'todo'] }
  },
  { timestamps: false, versionKey: false }
);

categorySchema.index({ t: 1 });

export default mongoose.model('Category', categorySchema);