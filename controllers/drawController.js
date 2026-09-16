import Draw from "../models/Draw.js";
import DrawEntry from "../models/DrawEntry.js";
// Create / simulate draw
export const createDraw = async (req, res) => {
  try {
    const { month, year, drawDate } = req.body;

    if (!month || !year || !drawDate) {
      return res.status(400).json({
        success: false,
        message: "Month, year and draw date are required",
      });
    }

    // Check existing draw
    const existingDraw = await Draw.findOne({
      month,
      year,
    });

    if (existingDraw) {
      return res.status(400).json({
        success: false,
        message: "Draw already exists for this month",
      });
    }

    // Generate 5 unique numbers between 1 and 45
    const winningNumbers = [];

    while (winningNumbers.length < 5) {
      const number = Math.floor(Math.random() * 45) + 1;

      if (!winningNumbers.includes(number)) {
        winningNumbers.push(number);
      }
    }

    // Sort numbers
    winningNumbers.sort((a, b) => a - b);

    const draw = await Draw.create({
      month,
      year,
      winningNumbers,
      drawDate,
      status: "draft",
    });

    return res.status(201).json({
      success: true,
      message: "Draw created successfully",
      draw,
    });
  } catch (error) {
    console.error("Create draw error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all draws
export const getAllDraws = async (req, res) => {
  try {
    const draws = await Draw.find().sort({
      year: -1,
      month: -1,
    });

    return res.status(200).json({
      success: true,
      count: draws.length,
      draws,
    });
  } catch (error) {
    console.error("Get draws error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single draw
export const getDrawById = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found",
      });
    }

    return res.status(200).json({
      success: true,
      draw,
    });
  } catch (error) {
    console.error("Get draw error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Publish draw
export const publishDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found",
      });
    }

    if (draw.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft draws can be published",
      });
    }

    draw.status = "published";
    draw.publishedAt = new Date();

    await draw.save();

    return res.status(200).json({
      success: true,
      message: "Draw published successfully",
      draw,
    });
  } catch (error) {
    console.error("Publish draw error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Complete draw
export const completeDraw = async (req, res) => {
  try {
    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found",
      });
    }

    if (draw.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Only published draws can be completed",
      });
    }

    draw.status = "completed";

    await draw.save();

    return res.status(200).json({
      success: true,
      message: "Draw completed successfully",
      draw,
    });
  } catch (error) {
    console.error("Complete draw error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



// ==========================================
// CALCULATE PRIZE POOL
// ==========================================
export const calculatePrizePool = async (req, res) => {
  try {
    const { totalPrizePool } = req.body;

    if (
      totalPrizePool === undefined ||
      totalPrizePool === null ||
      Number(totalPrizePool) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid total prize pool is required",
      });
    }

    const draw = await Draw.findById(req.params.id);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found",
      });
    }

    if (draw.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "Only published draws can calculate prize pool",
      });
    }

    const pool = Number(totalPrizePool);

    // PRD prize distribution
    const fiveMatchPrize = pool * 0.40;
    const fourMatchPrize = pool * 0.35;
    const threeMatchPrize = pool * 0.25;

    // Find winners
    const fiveMatchWinners = await DrawEntry.find({
      draw: draw._id,
      matchCount: 5,
    });

    const fourMatchWinners = await DrawEntry.find({
      draw: draw._id,
      matchCount: 4,
    });

    const threeMatchWinners = await DrawEntry.find({
      draw: draw._id,
      matchCount: 3,
    });

    // Calculate individual winner amount
    const fiveMatchWinnerAmount =
      fiveMatchWinners.length > 0
        ? fiveMatchPrize / fiveMatchWinners.length
        : 0;

    const fourMatchWinnerAmount =
      fourMatchWinners.length > 0
        ? fourMatchPrize / fourMatchWinners.length
        : 0;

    const threeMatchWinnerAmount =
      threeMatchWinners.length > 0
        ? threeMatchPrize / threeMatchWinners.length
        : 0;

    // Jackpot rollover if no 5-match winner
    const jackpotRolledOver = fiveMatchWinners.length === 0;

    draw.totalPrizePool = pool;

    if (jackpotRolledOver) {
      draw.jackpotAmount = fiveMatchPrize;
      draw.jackpotRolledOver = true;
    } else {
      draw.jackpotAmount = 0;
      draw.jackpotRolledOver = false;
    }

    await draw.save();

    return res.status(200).json({
      success: true,
      message: "Prize pool calculated successfully",

      prizePool: {
        total: pool,

        fiveMatch: {
          percentage: 40,
          poolAmount: fiveMatchPrize,
          winnerCount: fiveMatchWinners.length,
          amountPerWinner: fiveMatchWinnerAmount,
        },

        fourMatch: {
          percentage: 35,
          poolAmount: fourMatchPrize,
          winnerCount: fourMatchWinners.length,
          amountPerWinner: fourMatchWinnerAmount,
        },

        threeMatch: {
          percentage: 25,
          poolAmount: threeMatchPrize,
          winnerCount: threeMatchWinners.length,
          amountPerWinner: threeMatchWinnerAmount,
        },

        jackpot: {
          rolledOver: jackpotRolledOver,
          amount: jackpotRolledOver ? fiveMatchPrize : 0,
        },
      },

      draw,
    });
  } catch (error) {
    console.error("Calculate prize pool error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// GET CURRENT PUBLISHED DRAW - USER
// ==========================================
export const getCurrentDraw = async (req, res) => {
  try {
    const draw = await Draw.findOne({
      status: "published",
    }).sort({
      drawDate: 1,
    });

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "No active draw available",
      });
    }

    return res.status(200).json({
      success: true,
      draw,
    });
  } catch (error) {
    console.error("Get current draw error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};