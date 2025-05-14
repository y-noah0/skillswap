const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReactionSchema = new Schema({
  emoji: {
    type: String,
    required: true
  },
  users: [{
    type: String // User IDs who reacted with this emoji
  }]
});

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
    mediaType: {
      type: String,
      enum: ["none", "image", "file", "audio"],
      default: "none"
    },
    mediaUrl: {
      type: String,
      default: ""
    },
    fileName: {
      type: String,
      default: ""
    },
    fileSize: {
      type: Number,
      default: 0
    },
    readBy: [{
      type: String
    }],
    isDeleted: {
      type: Boolean,
      default: false
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editHistory: [{
      text: String,
      editedAt: Date
    }],
    reactions: [ReactionSchema],
    mentions: [{
      type: String // User IDs who are mentioned
    }],
    replyTo: {
      type: String, // Message ID this is replying to
      default: null
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    threadId: {
      type: String, // Thread this message belongs to
      default: null
    },
    formattingType: {
      type: String,
      enum: ["plaintext", "markdown", "richtext"],
      default: "plaintext"
    }
  },
  { timestamps: true }
);

const RoomMessageSchema = new Schema({
  roomId: {
    type: String,
  },
  senderId: {
    type: String,
  },
  text: {
    type: String,
  },
  mediaType: {
    type: String,
    enum: ["none", "image", "file", "audio"],
    default: "none"
  },
  mediaUrl: {
    type: String,
    default: ""
  },
  fileName: {
    type: String,
    default: ""
  },
  fileSize: {
    type: Number,
    default: 0
  },
  readBy: [{
    type: String
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    text: String,
    editedAt: Date
  }],
  reactions: [ReactionSchema],
  mentions: [{
    type: String // User IDs who are mentioned
  }],
  replyTo: {
    type: String, // Message ID this is replying to
    default: null
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  threadId: {
    type: String, // Thread this message belongs to
    default: null
  },
  formattingType: {
    type: String,
    enum: ["plaintext", "markdown", "richtext"],
    default: "plaintext"
  }
}, { timestamps: true });

const RoomMessageModel = mongoose.model("RoomMessage", RoomMessageSchema);
const MessageModel = mongoose.model("Message", MessageSchema);

module.exports = {
  MessageModel,
  RoomMessageModel,
};
