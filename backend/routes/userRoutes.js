const express = require("express");
const userController = require("../controllers/userControllers");
const router = express.Router();

router.get("/:userId", userController.get_user_by_id);

module.exports = router;
