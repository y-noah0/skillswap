const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ThreadSchema = new Schema(
  {
    parentMessageId: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      required: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    participants: [{
      type: String, // User IDs participating in the thread
    }],
    messageCount: {
      type: Number,
      default: 0,
    },
    title: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

const ThreadModel = mongoose.model("Thread", ThreadSchema);

module.exports = ThreadModel; 