import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    t: { type: String, required: true, trim: true },
    ti: { type: String, default: '' },
    da: { type: Date, required: true, index: true },
    p: { type: String, required: true, enum: ['low', 'medium', 'high', 'mandatory'], default: 'medium' },
    s: { type: Boolean, default: false }
  },
  { timestamps: true, versionKey: false }
);

todoSchema.index({ da: -1 });
todoSchema.index({ s: 1 });

export default mongoose.model('Todo', todoSchema);