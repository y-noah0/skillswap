const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    chatId: {
      type: String,
    },
    senderId: {
      type: String,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);

const RoomMessageSchema = new Schema({
  roomId: {
    type: String,
  },
  sendId: {
    type: String,
  },
  text: {
    type: String,
  },
});
const RoomMessageModel = mongoose.model("RoomMessage", RoomMessageSchema);
const MessageModel = mongoose.model("Message", MessageSchema);

module.exports = {
  MessageModel,
  RoomMessageModel,
};
