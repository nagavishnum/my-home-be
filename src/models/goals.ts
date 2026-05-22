import mongoose from 'mongoose';

const goalsSchema = new mongoose.Schema(
  {
    t: {
      type: String,
      required: true,
      trim: true
    },

    d: {
      type: String,
      trim: true,
      default: ''
    },

    c: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },

    td: {
      type: Date,
      required: true
    },

    p: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },

    s: {
      type: String,
      enum: [
        'pending',
        'inprogress',
        'completed'
      ],
      default: 'pending'
    },

    tv: {
      type: Number,
      default: 0
    },

    cv: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

goalsSchema.index({ td: -1 });

goalsSchema.index({ c: 1 });

export default mongoose.model(
  'Goal',
  goalsSchema
);