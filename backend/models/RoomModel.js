const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  senderId: {
    type: String,
    required: true
  },
  sender_name: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  }
});

const RoomSchema = new Schema({
  skill_id: {
    type: String,
    required: true,
    unique: true
  },
  members: [{
    userId: String,
    username: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  messages: [MessageSchema]
}, { timestamps: true });

const RoomModel = mongoose.model('Room', RoomSchema);
module.exports = RoomModel;