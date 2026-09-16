import mongoose from "mongoose";

const drawEntrySchema = new mongoose.Schema(
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

    scores: {
      type: [Number],
      required: true,
      validate: {
        validator: function (scores) {
          return (
            scores.length === 5 &&
            scores.every((score) => score >= 1 && score <= 45)
          );
        },
        message: "Exactly 5 scores between 1 and 45 are required",
      },
    },

    matchedNumbers: {
      type: [Number],
      default: [],
    },

    matchCount: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    prizeCategory: {
      type: String,
      enum: ["5_match", "4_match", "3_match", "no_prize"],
      default: "no_prize",
    },
  },
  {
    timestamps: true,
  }
);

drawEntrySchema.index(
  { draw: 1, user: 1 },
  { unique: true }
);

const DrawEntry = mongoose.model("DrawEntry", drawEntrySchema);

export default DrawEntry;