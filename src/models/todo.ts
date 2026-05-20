import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    t: { type: String, required: true, trim: true },
    da: { type: Date, required: true, index: true },
    p: { type: String, required: true, enum: ['low', 'medium', 'high', 'mandatory'], default: 'medium' },
  },
  { timestamps: false, versionKey: false }
);

todoSchema.index({ da: -1 });

export default mongoose.model('Todo', todoSchema);