import Charity from "../models/Charity.js";

// ==========================================
// CREATE CHARITY - ADMIN
// ==========================================
export const createCharity = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      upcomingEvents,
      isFeatured,
      isActive,
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required",
      });
    }

    const charity = await Charity.create({
      name,
      description,
      image,
      upcomingEvents,
      isFeatured,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Charity created successfully",
      charity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET ALL CHARITIES - PUBLIC
// ==========================================
export const getAllCharities = async (req, res) => {
  try {
    const charities = await Charity.find({
      isActive: true,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: charities.length,
      charities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// GET SINGLE CHARITY - PUBLIC
// ==========================================
export const getCharityById = async (req, res) => {
  try {
    const charity = await Charity.findOne({
      _id: req.params.id,
      isActive: true,
    });

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found",
      });
    }

    res.status(200).json({
      success: true,
      charity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// UPDATE CHARITY - ADMIN
// ==========================================
export const updateCharity = async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id);

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found",
      });
    }

    const {
      name,
      description,
      image,
      upcomingEvents,
      isFeatured,
      isActive,
    } = req.body;

    if (name !== undefined) charity.name = name;
    if (description !== undefined) charity.description = description;
    if (image !== undefined) charity.image = image;
    if (upcomingEvents !== undefined) {
      charity.upcomingEvents = upcomingEvents;
    }
    if (isFeatured !== undefined) {
      charity.isFeatured = isFeatured;
    }
    if (isActive !== undefined) {
      charity.isActive = isActive;
    }

    await charity.save();

    res.status(200).json({
      success: true,
      message: "Charity updated successfully",
      charity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================
// DELETE CHARITY - ADMIN
// ==========================================
export const deleteCharity = async (req, res) => {
  try {
    const charity = await Charity.findByIdAndDelete(req.params.id);

    if (!charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Charity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};