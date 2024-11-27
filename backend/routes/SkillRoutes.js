const express = require('express');
const skillController = require('../controllers/SkillController');

const router = express.Router();

// Route to create a new skill
router.post('/create', skillController.createSkill);

module.exports = router;