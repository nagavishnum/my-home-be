import mongoose from 'mongoose';

const financeSchema = new mongoose.Schema(
  {
    n: {
      type: String,
      required: true,
      trim: true,
    },

    c: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    a: {
      type: Number,
      required: true,
    },

    // SIP TOTAL INVESTED VALUE
    sv: {
      type: Number,
      default: 0,
    },

    ty: {
      type: String,
      required: true,
      enum: ['Monthly', 'OneTime'],
    },

    md: {
      type: Date,
      required: true,
    },

    lp: {
      type: Number,
      default: 0,
    },

    rt: {
      type: Number,
      default: 0,
    },

    cv: {
      type: Number,
      default: 0,
    },

    no: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

financeSchema.index({ md: -1 });
financeSchema.index({ c: 1 });

export default mongoose.model('Finance', financeSchema);