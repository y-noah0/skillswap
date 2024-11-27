const Skill = require("../models/SkillModel"); // Assuming you have a Skill model

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Skill name is required" });
    }

    const newSkill = new Skill({ name });
    await newSkill.save();

    res.status(201).json(newSkill);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
