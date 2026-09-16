import Razorpay from "razorpay";
import Subscription from "../models/Subscription.js";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// CREATE NORMAL RAZORPAY ORDER
// ==========================================

export const createSubscription = async (req, res) => {
  try {
    console.log("========== CREATE PAYMENT START ==========");

    const { plan } = req.body;

    console.log("User ID:", req.user?._id);
    console.log("Selected Plan:", plan);

    // ==========================================
    // VALIDATE PLAN
    // ==========================================

    if (!plan || !["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Plan must be monthly or yearly",
      });
    }

    // ==========================================
    // PLAN PRICE
    // ==========================================

    let amount;

    if (plan === "monthly") {
      amount = 99;
    }

    if (plan === "yearly") {
      amount = 999;
    }

    console.log("Plan:", plan);
    console.log("Amount:", amount);

    // Razorpay amount is in paise
    const amountInPaise = amount * 100;

    // ==========================================
    // CREATE RAZORPAY ORDER
    // ==========================================

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${req.user._id}_${Date.now()}`,
    });

    console.log("========== RAZORPAY ORDER CREATED ==========");

    console.log("Order ID:", order.id);
    console.log("Amount:", order.amount);
    console.log("Currency:", order.currency);

    console.log("============================================");

    return res.status(201).json({
      success: true,
      message: "Payment order created successfully",

      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },

      plan,
      amount,
    });
  } catch (error) {
    console.error("========== CREATE PAYMENT ERROR ==========");

    console.error("Message:", error.message);
    console.error("Status:", error.statusCode);
    console.error("Description:", error.description);

    console.error("==========================================");

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create payment order",
    });
  }
};

// ==========================================
// VERIFY NORMAL RAZORPAY PAYMENT
// ==========================================

export const verifySubscription = async (req, res) => {
  try {
    console.log("========== VERIFY PAYMENT START ==========");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body;

    console.log("Order ID:", razorpay_order_id);
    console.log("Payment ID:", razorpay_payment_id);
    console.log("Plan:", plan);

    // ==========================================
    // VALIDATE DATA
    // ==========================================

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !plan
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment verification details are missing",
      });
    }

    if (!["monthly", "yearly"].includes(plan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan",
      });
    }

    // ==========================================
    // GENERATE SIGNATURE
    // ==========================================

    const generatedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    // ==========================================
    // VERIFY SIGNATURE
    // ==========================================

    if (generatedSignature !== razorpay_signature) {
      console.log("❌ Invalid Razorpay signature");

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    console.log("✅ Razorpay payment verified");

    // ==========================================
    // CALCULATE DATES
    // ==========================================

    const startDate = new Date();

    const expiryDate = new Date(startDate);

    if (plan === "monthly") {
      expiryDate.setDate(
        expiryDate.getDate() + 30
      );
    }

    if (plan === "yearly") {
      expiryDate.setDate(
        expiryDate.getDate() + 365
      );
    }

    // ==========================================
    // PLAN PRICE
    // ==========================================

    let amount;

    if (plan === "monthly") {
      amount = 99;
    }

    if (plan === "yearly") {
      amount = 999;
    }

    // ==========================================
    // SAVE / UPDATE MEMBERSHIP
    // ==========================================

    const subscription =
      await Subscription.findOneAndUpdate(
        {
          user: req.user._id,
        },
        {
          user: req.user._id,
          plan,
          status: "active",
          startDate,
          expiryDate,
          razorpayPaymentId: razorpay_payment_id,
          amount,
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );

    console.log("========== MEMBERSHIP ACTIVATED ==========");

    console.log({
      user: req.user._id,
      plan,
      startDate,
      expiryDate,
      paymentId: razorpay_payment_id,
      amount,
    });

    console.log("==========================================");

    return res.status(200).json({
      success: true,

      message: "Payment verified successfully",

      subscription,

      paymentId: razorpay_payment_id,

      startDate,
      expiryDate,
    });
  } catch (error) {
    console.error("========== VERIFY PAYMENT ERROR ==========");

    console.error(error);

    console.error("==========================================");

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Payment verification failed",
    });
  }
};

// ==========================================
// GET MY MEMBERSHIP
// ==========================================

export const getMySubscription = async (req, res) => {
  try {
    const subscription =
      await Subscription.findOne({
        user: req.user._id,
      }).populate("user", "name email");

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No membership found",
      });
    }

    // ==========================================
    // CHECK EXPIRY
    // ==========================================

    const now = new Date();

    if (
      subscription.expiryDate &&
      now >= subscription.expiryDate
    ) {
      subscription.status = "expired";

      await subscription.save();
    }

    return res.status(200).json({
      success: true,
      subscription,
      isActive:
        subscription.status === "active" &&
        new Date() < subscription.expiryDate,
    });
  } catch (error) {
    console.error("Get membership error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET ALL MEMBERSHIPS - ADMIN
// ==========================================
export const getAllMemberships = async (req, res) => {
  try {
    const memberships = await Subscription.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    const now = new Date();

    const updatedMemberships = memberships.map((membership) => {
      const isActive =
        membership.status === "active" &&
        membership.expiryDate &&
        now < new Date(membership.expiryDate);

      return {
        ...membership.toObject(),
        status: isActive ? "active" : "expired",
      };
    });

    return res.status(200).json({
      success: true,
      count: updatedMemberships.length,
      memberships: updatedMemberships,
    });
  } catch (error) {
    console.error("Get all memberships error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load memberships",
    });
  }
};