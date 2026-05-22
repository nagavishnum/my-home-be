import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    u: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    p: {
      type: String,
      required: true
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

export default mongoose.model(
  'User',
  userSchema
);