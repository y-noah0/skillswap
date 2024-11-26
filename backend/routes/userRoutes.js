const express = require("express");
const userController = require("../controllers/userControllers");
const router = express.Router();

router.get("/:userId", userController.getUser);

module.exports = router;
