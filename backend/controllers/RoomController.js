const RoomModel = require("../models/RoomModel");
const User = require('../models/authModel');

const createRoom = async (req, res) => {
  const { skillId, userId, username } = req.body;
  try {
    let room = await RoomModel.findOne({ skill_id: skillId });
    
    if (!room) {
      room = new RoomModel({
        skill_id: skillId,
        members: [{ userId, username }],
        messages: []
      });
    } else {
      // Add member if not already in the room
      const memberExists = room.members.some(member => member.userId === userId);
      if (!memberExists) {
        room.members.push({ userId, username });
      }
    }
    
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getRooms = async (req, res) => {
  try {
    const rooms = await RoomModel.find();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getMessages = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await RoomModel.findOne({ skill_id: roomId });
    if (room) {
      res.status(200).json(room.messages);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const saveMessage = async (req, res) => {
  const { roomId, senderId, sender_name, message } = req.body;
  
  try {
    const room = await RoomModel.findOne({ skill_id: roomId });
    if (room) {
      room.messages.push({
        senderId,
        sender_name,
        message
      });
      await room.save();
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const getRoomMembers = async (req, res) => {
  const { roomId } = req.params;
  try {
    const room = await RoomModel.findOne({ skill_id: roomId });
    if (room) {
      res.status(200).json(room.members);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const editMessage = async (req, res) => {
  const { roomId, messageId, newMessage } = req.body;
  
  try {
    const room = await RoomModel.findOne({ skill_id: roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const message = room.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.message = newMessage;
    message.isEdited = true;
    message.editedAt = new Date();
    
    await room.save();
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteMessage = async (req, res) => {
  const { roomId, messageId } = req.body;
  
  try {
    const room = await RoomModel.findOne({ skill_id: roomId });
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const message = room.messages.id(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    message.isDeleted = true;
    message.message = "This message was deleted";
    
    await room.save();
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { 
  createRoom, 
  getRooms, 
  saveMessage, 
  getMessages,
  getRoomMembers,
  editMessage,
  deleteMessage
};
