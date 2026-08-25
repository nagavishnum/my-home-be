import mongoose from 'mongoose';

const financeSnapshotSchema = new mongoose.Schema(
  {
    // YYYYMM - e.g. 202608
    p: {
      type: Number,
      required: true,
    },

    // Aggregated category values
    c: [
      {
        _id: false,

        // Category identifier
        k: {
          type: String,
          required: true,
        },

        // Category total value for that month
        v: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

financeSnapshotSchema.index(
  { p: 1 },
  { unique: true },
);

financeSnapshotSchema.index({
  p: -1,
});

export default mongoose.model(
  'FinanceSnapshot',
  financeSnapshotSchema,
);