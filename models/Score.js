import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 1,
      max: 45,
    },

    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Same user cannot have two scores on the same date
scoreSchema.index({ user: 1, date: 1 }, { unique: true });

const Score = mongoose.model("Score", scoreSchema);

export default Score;