const express = require("express");
const {
  createRoom,
  getRooms,
  saveMessage,
  getMessages,
} = require("../controllers/RoomController");

const router = express.Router();

// Route to create a new room
router.post("/create", createRoom);

// Route to get all rooms
router.get("/", getRooms);

// Route to save a message in a room
router.post("/message", saveMessage);

// Route to get all messages in a room
router.get("/messages/:roomId", getMessages);

module.exports = router;
