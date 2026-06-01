import mongoose from "mongoose";

const dailytodoSchema = new mongoose.Schema(
    {
        t: { type: String, required: true },
    },
    { timestamps: false, versionKey: false }
);


export default mongoose.model('DailyTodo', dailytodoSchema);