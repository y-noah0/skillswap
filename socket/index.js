const { connect } = require("mongoose");
const RoomMessageModel = require("../backend/models/RoomMessageModel");
const mongoose = require("mongoose");
const { MessageModel } = require("../backend/models/MessageModel");
const ThreadModel = require("../backend/models/ThreadModel");
const io = require("socket.io")(8800, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

mongoose.connect("mongodb://localhost:27017/skillswap", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Track active users
const activeUsers = [];

// Track users who are typing
const typingUsers = {};

// Track active voice channels
const activeVoiceChannels = {};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Add new user
  socket.on("new-user-add", (newUserId) => {
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({
        userId: newUserId,
        socketId: socket.id,
      });
    }
    console.log("Connected users:", activeUsers);
    io.emit("get-users", activeUsers);
  });

  // Handle private messages
  socket.on("send-message", (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    if (user) {
      io.to(user.socketId).emit("receive-message", data);
    }
  });

  // Handle message editing
  socket.on("edit-message", async (data) => {
    const { messageId, text, senderId, channelId, serverId, mentions } = data;
    
    try {
      // Update message in database
      const message = await MessageModel.findById(messageId);
      if (message && message.senderId === senderId) {
        // Save current text to edit history
        message.editHistory.push({
          text: message.text,
          editedAt: new Date()
        });
        
        message.text = text;
        message.isEdited = true;
        message.mentions = mentions || message.mentions;
        
        await message.save();
        
        // Broadcast the edit to all users
        if (serverId) {
          // Server/channel message
          io.to(`server:${serverId}`).emit("message-edited", {
            messageId,
            text,
            isEdited: true,
            editedAt: new Date(),
            mentions
          });
        } else {
          // Direct message
          const chat = await ChatModel.findById(message.chatId);
          if (chat) {
            chat.members.forEach(memberId => {
              const user = activeUsers.find(u => u.userId === memberId);
              if (user) {
                io.to(user.socketId).emit("message-edited", {
                  messageId,
                  text,
                  isEdited: true,
                  editedAt: new Date(),
                  mentions
                });
              }
            });
          }
        }
        
        // Notify mentioned users
        if (mentions && mentions.length > 0) {
          mentions.forEach(userId => {
            const user = activeUsers.find(u => u.userId === userId);
            if (user) {
              io.to(user.socketId).emit("user-mentioned", {
                messageId,
                text,
                senderId,
                channelId,
                serverId
              });
            }
          });
        }
      }
    } catch (error) {
      console.error("Error editing message:", error);
    }
  });

  // Handle message deletion
  socket.on("delete-message", async (data) => {
    const { messageId, senderId, channelId, serverId } = data;
    
    try {
      // Update message in database
      const message = await MessageModel.findById(messageId);
      if (message && message.senderId === senderId) {
        message.isDeleted = true;
        await message.save();
        
        // Broadcast the deletion to all users
        if (serverId) {
          // Server/channel message
          io.to(`server:${serverId}`).emit("message-deleted", {
            messageId,
            channelId
          });
        } else {
          // Direct message
          const chat = await ChatModel.findById(message.chatId);
          if (chat) {
            chat.members.forEach(memberId => {
              const user = activeUsers.find(u => u.userId === memberId);
              if (user) {
                io.to(user.socketId).emit("message-deleted", {
                  messageId,
                  chatId: message.chatId
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });

  // Handle message reactions
  socket.on("add-reaction", async (data) => {
    const { messageId, emoji, userId, channelId, serverId } = data;
    
    try {
      // Update message in database
      const message = await MessageModel.findById(messageId);
      if (message) {
        // Find if this emoji already has a reaction
        const existingReaction = message.reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          // Check if user already reacted with this emoji
          if (existingReaction.users.includes(userId)) {
            // Remove user from this reaction
            existingReaction.users = existingReaction.users.filter(id => id !== userId);
            
            // If no users left, remove the reaction entirely
            if (existingReaction.users.length === 0) {
              message.reactions = message.reactions.filter(r => r.emoji !== emoji);
            }
          } else {
            // Add user to existing reaction
            existingReaction.users.push(userId);
          }
        } else {
          // Create new reaction
          message.reactions.push({
            emoji,
            users: [userId]
          });
        }
        
        await message.save();
        
        // Broadcast the reaction update to all users
        if (serverId) {
          // Server/channel message
          io.to(`server:${serverId}`).emit("reaction-updated", {
            messageId,
            reactions: message.reactions,
            channelId
          });
        } else {
          // Direct message
          const chat = await ChatModel.findById(message.chatId);
          if (chat) {
            chat.members.forEach(memberId => {
              const user = activeUsers.find(u => u.userId === memberId);
              if (user) {
                io.to(user.socketId).emit("reaction-updated", {
                  messageId,
                  reactions: message.reactions,
                  chatId: message.chatId
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  });

  // Handle message pinning
  socket.on("pin-message", async (data) => {
    const { messageId, userId, channelId, serverId } = data;
    
    try {
      // Update message in database
      const message = await MessageModel.findById(messageId);
      if (message) {
        message.isPinned = !message.isPinned;
        await message.save();
        
        // Broadcast the pin update to all users
        if (serverId) {
          // Server/channel message
          io.to(`server:${serverId}`).emit("pin-updated", {
            messageId,
            isPinned: message.isPinned,
            channelId
          });
        } else {
          // Direct message
          const chat = await ChatModel.findById(message.chatId);
          if (chat) {
            chat.members.forEach(memberId => {
              const user = activeUsers.find(u => u.userId === memberId);
              if (user) {
                io.to(user.socketId).emit("pin-updated", {
                  messageId,
                  isPinned: message.isPinned,
                  chatId: message.chatId
                });
              }
            });
          }
        }
      }
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  });

  // Handle thread creation
  socket.on("create-thread", async (data) => {
    const { messageId, userId, title, initialMessage } = data;
    
    try {
      // Create thread in database
      const parentMessage = await MessageModel.findById(messageId);
      if (!parentMessage) return;
      
      // Check if thread already exists
      let thread = await ThreadModel.findOne({ parentMessageId: messageId });
      
      if (!thread) {
        // Create new thread
        thread = new ThreadModel({
          parentMessageId: messageId,
          chatId: parentMessage.chatId,
          participants: [parentMessage.senderId, userId],
          title: title || ""
        });
        
        await thread.save();
        
        // Update parent message with thread ID
        parentMessage.threadId = thread._id;
        await parentMessage.save();
      }
      
      // If there's an initial reply message, create it
      if (initialMessage) {
        const message = new MessageModel({
          chatId: parentMessage.chatId,
          senderId: userId,
          text: initialMessage,
          threadId: thread._id,
          replyTo: messageId,
          readBy: [userId]
        });
        
        await message.save();
        
        // Update thread stats
        thread.lastActivity = Date.now();
        thread.messageCount = (thread.messageCount || 0) + 1;
        if (!thread.participants.includes(userId)) {
          thread.participants.push(userId);
        }
        await thread.save();
      }
      
      // Notify relevant users
      const notifyUsers = [...new Set([parentMessage.senderId, userId])];
      notifyUsers.forEach(uid => {
        const user = activeUsers.find(u => u.userId === uid);
        if (user) {
          io.to(user.socketId).emit("thread-created", {
            threadId: thread._id,
            parentMessageId: messageId,
            chatId: parentMessage.chatId
          });
        }
      });
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  });

  // Handle user typing indicators
  socket.on("typing", (data) => {
    const { chatId, userId, isTyping } = data;
    
    if (!typingUsers[chatId]) {
      typingUsers[chatId] = [];
    }
    
    if (isTyping) {
      // Add user to typing list if not already there
      if (!typingUsers[chatId].includes(userId)) {
        typingUsers[chatId].push(userId);
      }
    } else {
      // Remove user from typing list
      typingUsers[chatId] = typingUsers[chatId].filter(id => id !== userId);
    }
    
    // Broadcast typing status to all users
    io.emit("typing-update", { chatId, typingUsers: typingUsers[chatId] });
  });

  // Handle message read receipts
  socket.on("message-read", (data) => {
    const { messageId, chatId, userId } = data;
    
    // Broadcast to all users in the chat that the message has been read
    io.emit("message-read-update", { messageId, chatId, userId });
  });

  // Handle server and channel events
  socket.on("join-server", (serverId) => {
    socket.join(`server:${serverId}`);
    console.log(`User joined server: ${serverId}`);
  });
  
  socket.on("leave-server", (serverId) => {
    socket.leave(`server:${serverId}`);
    console.log(`User left server: ${serverId}`);
  });
  
  socket.on("join-channel", (channelId) => {
    socket.join(`channel:${channelId}`);
    console.log(`User joined channel: ${channelId}`);
  });
  
  socket.on("leave-channel", (channelId) => {
    socket.leave(`channel:${channelId}`);
    console.log(`User left channel: ${channelId}`);
  });

  // Voice channel events
  socket.on("join-voice-channel", (data) => {
    const { channelId, userId, serverId } = data;
    
    // Register user in voice channel
    if (!activeVoiceChannels[channelId]) {
      activeVoiceChannels[channelId] = [];
    }
    
    if (!activeVoiceChannels[channelId].includes(userId)) {
      activeVoiceChannels[channelId].push(userId);
    }
    
    // Join socket room for this voice channel
    socket.join(`voice:${channelId}`);
    
    // Broadcast to server that user joined voice
    io.to(`server:${serverId}`).emit("voice-state-updated", {
      channelId,
      users: activeVoiceChannels[channelId]
    });
  });
  
  socket.on("leave-voice-channel", (data) => {
    const { channelId, userId, serverId } = data;
    
    // Remove user from voice channel
    if (activeVoiceChannels[channelId]) {
      activeVoiceChannels[channelId] = activeVoiceChannels[channelId].filter(id => id !== userId);
      
      // Clean up empty channels
      if (activeVoiceChannels[channelId].length === 0) {
        delete activeVoiceChannels[channelId];
      } else {
        // Notify others in the voice channel
        io.to(`voice:${channelId}`).emit("voice-user-disconnected", {
          userId,
          channelId,
          users: activeVoiceChannels[channelId]
        });
      }
    }
    
    // Leave socket room for this voice channel
    socket.leave(`voice:${channelId}`);
    
    // Broadcast to server that user left voice
    io.to(`server:${serverId}`).emit("voice-state-updated", {
      channelId,
      users: activeVoiceChannels[channelId] || []
    });
  });
  
  // WebRTC signaling for voice chat
  socket.on("voice-signal", (data) => {
    const { channelId, to, from, signal } = data;
    
    // Find recipient socket
    const recipient = activeUsers.find(user => user.userId === to);
    if (recipient) {
      io.to(recipient.socketId).emit("voice-signal", {
        from,
        signal,
        channelId
      });
    }
  });

  // Room-related events
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("send_message", (data) => {
    // Broadcast the message to all users in the room
    io.to(data.roomId).emit("receive_message", data);
  });

  socket.on("edit_message", (data) => {
    io.to(data.roomId).emit("message_edited", data);
  });

  socket.on("delete_message", (data) => {
    io.to(data.roomId).emit("message_deleted", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    // Find and remove user from active users
    const index = activeUsers.findIndex((user) => user.socketId === socket.id);
    if (index !== -1) {
      const userId = activeUsers[index].userId;
      
      // Remove user from all typing lists
      Object.keys(typingUsers).forEach(chatId => {
        typingUsers[chatId] = typingUsers[chatId].filter(id => id !== userId);
        // Broadcast updated typing status
        io.emit("typing-update", { chatId, typingUsers: typingUsers[chatId] });
      });
      
      // Remove user from all voice channels
      Object.keys(activeVoiceChannels).forEach(channelId => {
        if (activeVoiceChannels[channelId].includes(userId)) {
          activeVoiceChannels[channelId] = activeVoiceChannels[channelId].filter(id => id !== userId);
          
          // Clean up empty channels
          if (activeVoiceChannels[channelId].length === 0) {
            delete activeVoiceChannels[channelId];
          } else {
            // Notify others in the voice channel
            io.to(`voice:${channelId}`).emit("voice-user-disconnected", {
              userId,
              channelId,
              users: activeVoiceChannels[channelId]
            });
          }
        }
      });
      
      // Remove user from active users
      activeUsers.splice(index, 1);
      console.log("User disconnected:", userId);
      
      // Notify other users
      io.emit("get-users", activeUsers);
    }
  });
});
