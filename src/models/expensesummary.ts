// models/expensesummary.ts

import mongoose from 'mongoose';

const expenseSummarySchema =
  new mongoose.Schema(
    {
      y: {
        type: Number,
        required: true
      },

      m: {
        type: Number,
        required: true
      },

      t: {
        type: Number,
        required: true,
        default: 0
      },

      c: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true
          },

          a: {
            type: Number,
            required: true
          }
        }
      ]
    },
    {
      timestamps: false,
      versionKey: false
    }
  );

expenseSummarySchema.index(
  {
    y: 1,
    m: 1
  },
  {
    unique: true
  }
);

export default mongoose.model(
  'ExpenseSummary',
  expenseSummarySchema
);