import User from "../models/User.js";
import Subscription from "../models/Subscription.js";
import Charity from "../models/Charity.js";

// ==========================================
// ADMIN DASHBOARD
// ==========================================

export const getAdminDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: "user",
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    const totalMembers = await Subscription.countDocuments();

    const activeMembers = await Subscription.countDocuments({
      status: "active",
      expiryDate: {
        $gt: new Date(),
      },
    });

    const expiredMembers = await Subscription.countDocuments({
      $or: [
        { status: "expired" },
        {
          expiryDate: {
            $lte: new Date(),
          },
        },
      ],
    });

    const totalCharities = await Charity.countDocuments();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalAdmins,
        totalMembers,
        activeMembers,
        expiredMembers,
        totalCharities,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};