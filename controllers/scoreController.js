import Score from "../models/Score.js";

// ==========================================
// ADD SCORE
// ==========================================
export const addScore = async (req, res) => {
  try {
    const { score, date } = req.body;

    if (score === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: "Score and date are required",
      });
    }

    if (score < 1 || score > 45) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 1 and 45",
      });
    }

    // Check duplicate date
    const existingScore = await Score.findOne({
      user: req.user._id,
      date: new Date(date),
    });

    if (existingScore) {
      return res.status(400).json({
        success: false,
        message: "You already have a score for this date",
      });
    }

    // Create new score
    const newScore = await Score.create({
      user: req.user._id,
      score,
      date: new Date(date),
    });

    // Get all scores for this user
    const allScores = await Score.find({
      user: req.user._id,
    }).sort({ date: -1 });

    // Keep only latest 5
    if (allScores.length > 5) {
      const scoresToDelete = allScores.slice(5);

      const idsToDelete = scoresToDelete.map((item) => item._id);

      await Score.deleteMany({
        _id: { $in: idsToDelete },
      });
    }

    const scores = await Score.find({
      user: req.user._id,
    }).sort({ date: -1 });

    res.status(201).json({
      success: true,
      message: "Score added successfully",
      scores,
    });
  } catch (error) {
    // Duplicate index error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already have a score for this date",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET MY SCORES
// ==========================================
export const getMyScores = async (req, res) => {
  try {
    const scores = await Score.find({
      user: req.user._id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: scores.length,
      scores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE SCORE
// ==========================================
export const updateScore = async (req, res) => {
  try {
    const { id } = req.params;
    const { score, date } = req.body;

    if (score === undefined || !date) {
      return res.status(400).json({
        success: false,
        message: "Score and date are required",
      });
    }

    if (score < 1 || score > 45) {
      return res.status(400).json({
        success: false,
        message: "Score must be between 1 and 45",
      });
    }

    const existingScore = await Score.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!existingScore) {
      return res.status(404).json({
        success: false,
        message: "Score not found",
      });
    }

    // Check if another score already uses this date
    const duplicateScore = await Score.findOne({
      user: req.user._id,
      date: new Date(date),
      _id: { $ne: id },
    });

    if (duplicateScore) {
      return res.status(400).json({
        success: false,
        message: "You already have a score for this date",
      });
    }

    existingScore.score = score;
    existingScore.date = new Date(date);

    await existingScore.save();

    const scores = await Score.find({
      user: req.user._id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: "Score updated successfully",
      scores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE SCORE
// ==========================================
export const deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const score = await Score.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: "Score not found",
      });
    }

    const scores = await Score.find({
      user: req.user._id,
    }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      message: "Score deleted successfully",
      scores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};