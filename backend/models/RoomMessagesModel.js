const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoomMessageSchema = new Schema({
  roomId: {
    type: String,
  },
  message: {
    type: Array,
  }
});
const RoomMessageModel = mongoose.model("RoomMessage", RoomMessageSchema);

module.exports = RoomMessageModel;
