const RoomModel = require("../models/RoomModel");
const User = require('../models/authModel')
const { create } = require("../models/SkillModel");

const createRoom = async (req, res) => {
  const { skillId, senderId } = req.body;
  try {
    const roomExists = await RoomModel.find({ skillId: skillId });
    if (roomExists) {
      const newArray = roomExists.members;
      newArray.push(skillId);
      const updateRoom = await RoomModel.findOneAndUpdate(
        {
          skillId: skillId,
        },
        { members: newArray }
      );
      updateRoom.save();
      res.status(200).json(updateRoom);
    } else {
      const newRoom = new RoomModel({
        skillId,
        members: [senderId],
      });
      newRoom.save();
    }
    res.status(200).json(newRoom);
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
    const room = await RoomModel.findById(roomId);
    if (room) {
      const messages = [];
      
      for (const message of room.messages) {
        const user = await User.findById(message.senderId);
        message["sender_name"] = user.username;
        messages.unshift(message);
      }
      
      res.status(200).json(messages);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const saveMessage = async (req, res) => {

  const { roomId, senderId, message } = req.body;
  console.log(roomId, senderId, message);
  
  try {
    const room = await RoomModel.findById(roomId);
    if (room) {
      room.messages.push({ senderId, message });
      await room.save();
      res.status(200).json(room);
    } else {
      res.status(404).json({ message: "Room not found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = { createRoom, getRooms, saveMessage, getMessages };
