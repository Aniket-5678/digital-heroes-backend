import mongoose from "mongoose";

const drawSchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },

    year: {
      type: Number,
      required: true,
    },

    winningNumbers: {
      type: [Number],
      required: true,
      validate: {
        validator: function (numbers) {
          return (
            numbers.length === 5 &&
            numbers.every((number) => number >= 1 && number <= 45)
          );
        },
        message: "Winning numbers must contain 5 numbers between 1 and 45",
      },
    },

    status: {
      type: String,
      enum: ["draft", "published", "completed"],
      default: "draft",
    },

    totalPrizePool: {
      type: Number,
      default: 0,
    },

    jackpotAmount: {
      type: Number,
      default: 0,
    },

    jackpotRolledOver: {
      type: Boolean,
      default: false,
    },

    drawDate: {
      type: Date,
      required: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Same month + year ka duplicate draw prevent karega
drawSchema.index(
  { month: 1, year: 1 },
  { unique: true }
);

const Draw = mongoose.model("Draw", drawSchema);

export default Draw;