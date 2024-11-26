const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ChatSchema = new Schema(
  {
    members: {
      type: Array,
    },
  },
  { timestamps: true }
);

const ChatModel = mongoose.model('Chat', ChatSchema)

module.exports = ChatModel
