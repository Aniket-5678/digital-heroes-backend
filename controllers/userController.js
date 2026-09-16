import User from "../models/User.js";
import Charity from "../models/Charity.js";

export const getMyProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// SELECT / UPDATE CHARITY
// ==========================================
export const updateMyCharity = async (req, res) => {
  try {
    const { charityId, charityPercentage } = req.body;

    if (!charityId) {
      return res.status(400).json({
        success: false,
        message: "Charity is required",
      });
    }

    // Check charity exists and is active
    const charity = await Charity.findOne({
      _id: charityId,
      isActive: true,
    });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found or inactive",
      });
    }

    // Default = 10%
    const percentage =
      charityPercentage === undefined ? 10 : Number(charityPercentage);

    // Minimum 10%
    if (percentage < 10 || percentage > 100) {
      return res.status(400).json({
        success: false,
        message: "Charity contribution must be between 10% and 100%",
      });
    }

    req.user.selectedCharity = charity._id;
    req.user.charityPercentage = percentage;

    await req.user.save();

    const updatedUser = await req.user.populate("selectedCharity");

    res.status(200).json({
      success: true,
      message: "Charity selection updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET ALL USERS - ADMIN
// ==========================================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("selectedCharity", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};