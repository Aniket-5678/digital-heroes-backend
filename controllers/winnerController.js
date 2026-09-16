import Draw from "../models/Draw.js";
import DrawEntry from "../models/DrawEntry.js";
import Winner from "../models/Winner.js";

// ==========================================
// CREATE WINNERS FOR A DRAW
// ==========================================
export const createWinners = async (req, res) => {
  try {
    const { drawId } = req.params;

    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found",
      });
    }

    if (draw.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Only published draws can create winners",
      });
    }

    if (draw.totalPrizePool <= 0) {
      return res.status(400).json({
        success: false,
        message: "Prize pool has not been calculated",
      });
    }

    // Find all winning entries
    const winningEntries = await DrawEntry.find({
      draw: drawId,
      matchCount: { $gte: 3 },
    });

    if (winningEntries.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No winners found for this draw",
      });
    }

    // Separate categories
    const fiveMatchWinners = winningEntries.filter(
      (entry) => entry.matchCount === 5
    );

    const fourMatchWinners = winningEntries.filter(
      (entry) => entry.matchCount === 4
    );

    const threeMatchWinners = winningEntries.filter(
      (entry) => entry.matchCount === 3
    );

    const fiveMatchPool = draw.totalPrizePool * 0.40;
    const fourMatchPool = draw.totalPrizePool * 0.35;
    const threeMatchPool = draw.totalPrizePool * 0.25;

    const winners = [];

    // ==========================================
    // 5 MATCH
    // ==========================================
    if (fiveMatchWinners.length > 0) {
      const amountPerWinner =
        fiveMatchPool / fiveMatchWinners.length;

      for (const entry of fiveMatchWinners) {
        const winner = await Winner.findOneAndUpdate(
          {
            draw: drawId,
            user: entry.user,
            matchCategory: "5_match",
          },
          {
            draw: drawId,
            user: entry.user,
            drawEntry: entry._id,
            matchCategory: "5_match",
            matchedNumbers: entry.matchedNumbers,
            prizeAmount: amountPerWinner,
          },
          {
            new: true,
            upsert: true,
          }
        );

        winners.push(winner);
      }
    }

    // ==========================================
    // 4 MATCH
    // ==========================================
    if (fourMatchWinners.length > 0) {
      const amountPerWinner =
        fourMatchPool / fourMatchWinners.length;

      for (const entry of fourMatchWinners) {
        const winner = await Winner.findOneAndUpdate(
          {
            draw: drawId,
            user: entry.user,
            matchCategory: "4_match",
          },
          {
            draw: drawId,
            user: entry.user,
            drawEntry: entry._id,
            matchCategory: "4_match",
            matchedNumbers: entry.matchedNumbers,
            prizeAmount: amountPerWinner,
          },
          {
            new: true,
            upsert: true,
          }
        );

        winners.push(winner);
      }
    }

    // ==========================================
    // 3 MATCH
    // ==========================================
    if (threeMatchWinners.length > 0) {
      const amountPerWinner =
        threeMatchPool / threeMatchWinners.length;

      for (const entry of threeMatchWinners) {
        const winner = await Winner.findOneAndUpdate(
          {
            draw: drawId,
            user: entry.user,
            matchCategory: "3_match",
          },
          {
            draw: drawId,
            user: entry.user,
            drawEntry: entry._id,
            matchCategory: "3_match",
            matchedNumbers: entry.matchedNumbers,
            prizeAmount: amountPerWinner,
          },
          {
            new: true,
            upsert: true,
          }
        );

        winners.push(winner);
      }
    }

    return res.status(201).json({
      success: true,
      message: "Winners created successfully",
      count: winners.length,
      winners,
    });
  } catch (error) {
    console.error("Create winners error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const submitWinnerProof = async (req, res) => {
  try {
    const { proofUrl } = req.body;

    if (!proofUrl) {
      return res.status(400).json({
        success: false,
        message: "Proof URL is required",
      });
    }

    const winner = await Winner.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found",
      });
    }

    if (winner.verificationStatus === "approved") {
      return res.status(400).json({
        success: false,
        message: "Winner is already approved",
      });
    }

    winner.proofUrl = proofUrl;
    winner.verificationStatus = "pending";

    await winner.save();

    return res.status(200).json({
      success: true,
      message: "Winner proof submitted successfully",
      winner,
    });
  } catch (error) {
    console.error("Submit winner proof error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const verifyWinner = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected",
      });
    }

    const winner = await Winner.findById(req.params.id);

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found",
      });
    }

    if (!winner.proofUrl) {
      return res.status(400).json({
        success: false,
        message: "Winner proof has not been submitted",
      });
    }

    winner.verificationStatus = status;

    // If rejected, payment should remain pending
    if (status === "rejected") {
      winner.paymentStatus = "pending";
      winner.paidAt = null;
    }

    await winner.save();

    return res.status(200).json({
      success: true,
      message: `Winner ${status} successfully`,
      winner,
    });
  } catch (error) {
    console.error("Verify winner error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const markWinnerAsPaid = async (req, res) => {
  try {
    const winner = await Winner.findById(req.params.id);

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found",
      });
    }

    if (winner.verificationStatus !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Winner must be approved before payment",
      });
    }

    if (winner.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment is already marked as paid",
      });
    }

    winner.paymentStatus = "paid";
    winner.paidAt = new Date();

    await winner.save();

    return res.status(200).json({
      success: true,
      message: "Winner payment marked as paid",
      winner,
    });
  } catch (error) {
    console.error("Mark winner paid error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET ALL WINNERS - ADMIN
// ==========================================
export const getAllWinners = async (req, res) => {
  try {
    const winners = await Winner.find()
      .populate("user", "name email")
      .populate("draw", "title drawDate status")
      .populate("drawEntry")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: winners.length,
      winners,
    });
  } catch (error) {
    console.error("Get all winners error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load winners",
    });
  }
};


// ==========================================
// GET MY WINNINGS - USER
// ==========================================
export const getMyWinners = async (req, res) => {
  try {
    const winners = await Winner.find({
      user: req.user._id,
    })
      .populate("draw", "title drawDate status")
      .populate("drawEntry")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: winners.length,
      winners,
    });
  } catch (error) {
    console.error("Get my winners error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to load your winnings",
    });
  }
};


// ==========================================
// ADMIN - CREATE MANUAL WINNER
// ==========================================
export const createManualWinner = async (req, res) => {
  try {
    const { drawId, userId, matchCategory, prizeAmount } = req.body;

    // -----------------------------
    // VALIDATION
    // -----------------------------
    if (!drawId || !userId || !matchCategory || prizeAmount === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Draw, user, match category and prize amount are required",
      });
    }

    if (!["5_match", "4_match", "3_match"].includes(matchCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid match category",
      });
    }

    const amount = Number(prizeAmount);

    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Prize amount must be a valid number",
      });
    }

    // -----------------------------
    // CHECK DRAW
    // -----------------------------
    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found",
      });
    }

    // -----------------------------
    // CHECK USER THROUGH DRAW ENTRY
    // -----------------------------
    const drawEntry = await DrawEntry.findOne({
      draw: drawId,
      user: userId,
    });

    if (!drawEntry) {
      return res.status(400).json({
        success: false,
        message: "This user has not entered the selected draw",
      });
    }

    // -----------------------------
    // CHECK DUPLICATE WINNER
    // -----------------------------
    const existingWinner = await Winner.findOne({
      draw: drawId,
      user: userId,
      matchCategory,
    });

    if (existingWinner) {
      return res.status(409).json({
        success: false,
        message:
          "This user is already a winner in this category for this draw",
      });
    }

    // -----------------------------
    // CREATE WINNER
    // -----------------------------
    const winner = await Winner.create({
      draw: drawId,
      user: userId,
      drawEntry: drawEntry._id,
      matchCategory,
      matchedNumbers: drawEntry.matchedNumbers || [],
      prizeAmount: amount,
      verificationStatus: "pending",
      paymentStatus: "pending",
    });

    // -----------------------------
    // POPULATE RESPONSE
    // -----------------------------
    const populatedWinner = await Winner.findById(winner._id)
      .populate("user", "name email")
      .populate("draw", "title drawDate status")
      .populate("drawEntry");

    return res.status(201).json({
      success: true,
      message: "Winner created successfully",
      winner: populatedWinner,
    });
  } catch (error) {
    console.error("Create manual winner error:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message || "Unable to create winner",
    });
  }
};