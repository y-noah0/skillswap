const express = require("express");
const {
  createRoom,
  getRooms,
  saveMessage,
  getMessages,
  getRoomMembers,
  editMessage,
  deleteMessage
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

// Route to get room members
router.get("/members/:roomId", getRoomMembers);

// Route to edit a message
router.put("/message/edit", editMessage);

// Route to delete a message
router.delete("/message/delete", deleteMessage);

module.exports = router;
