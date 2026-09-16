import mongoose from "mongoose";

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    upcomingEvents: [
      {
        title: {
          type: String,
          trim: true,
        },

        date: {
          type: Date,
        },

        location: {
          type: String,
          trim: true,
        },
      },
    ],

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Charity = mongoose.model("Charity", charitySchema);

export default Charity;