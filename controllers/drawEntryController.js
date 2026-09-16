import Draw from "../models/Draw.js";
import DrawEntry from "../models/DrawEntry.js";
import Score from "../models/Score.js";

export const participateInDraw = async (req, res) => {
  try {
    const { drawId } = req.body;

    if (!drawId) {
      return res.status(400).json({
        success: false,
        message: "Draw ID is required",
      });
    }

    // Find draw
    const draw = await Draw.findById(drawId);

    if (!draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found",
      });
    }

    // Only published draw can accept participation
    if (draw.status !== "published") {
      return res.status(400).json({
        success: false,
        message: "This draw is not open for participation",
      });
    }

    // Check if user already participated
    const existingEntry = await DrawEntry.findOne({
      draw: drawId,
      user: req.user._id,
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: "You have already participated in this draw",
        entry: existingEntry,
      });
    }

    // Get latest 5 scores
    const scores = await Score.find({
      user: req.user._id,
    })
      .sort({ date: -1 })
      .limit(5);

    if (scores.length < 5) {
      return res.status(400).json({
        success: false,
        message: "You need at least 5 scores to participate",
      });
    }

    const userScores = scores.map((score) => score.score);

    // Calculate matching numbers
    const matchedNumbers = userScores.filter((score) =>
      draw.winningNumbers.includes(score)
    );

    const uniqueMatchedNumbers = [...new Set(matchedNumbers)];

    const matchCount = uniqueMatchedNumbers.length;

    let prizeCategory = "no_prize";

    if (matchCount === 5) {
      prizeCategory = "5_match";
    } else if (matchCount === 4) {
      prizeCategory = "4_match";
    } else if (matchCount === 3) {
      prizeCategory = "3_match";
    }

    // Create entry
    const entry = await DrawEntry.create({
      draw: drawId,
      user: req.user._id,
      scores: userScores,
      matchedNumbers: uniqueMatchedNumbers,
      matchCount,
      prizeCategory,
    });

    return res.status(201).json({
      success: true,
      message: "Successfully participated in the draw",
      entry,
    });
  } catch (error) {
    console.error("Draw participation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};