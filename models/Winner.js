import mongoose from "mongoose";

const winnerSchema = new mongoose.Schema(
  {
    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Draw",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    drawEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DrawEntry",
      required: true,
    },

    matchCategory: {
      type: String,
      enum: ["5_match", "4_match", "3_match"],
      required: true,
    },

    matchedNumbers: {
      type: [Number],
      default: [],
    },

    prizeAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    proofUrl: {
      type: String,
      default: null,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

winnerSchema.index(
  { draw: 1, user: 1, matchCategory: 1 },
  { unique: true }
);

const Winner = mongoose.model("Winner", winnerSchema);

export default Winner;