const { MessageModel } = require("../models/MessageModel");
const ThreadModel = require("../models/ThreadModel");
const mongoose = require("mongoose");

// Helper function to extract mentions from text
const extractMentions = (text) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

// Rate limiting map (for anti-spam)
const messageRateLimits = new Map(); // userId -> { lastMessageTime, messageCount }

// Rate limit check middleware
const checkRateLimit = (userId) => {
  const now = Date.now();
  const userRateLimit = messageRateLimits.get(userId) || { lastMessageTime: 0, messageCount: 0 };
  
  // Reset count if more than 60 seconds since last message
  if (now - userRateLimit.lastMessageTime > 60000) {
    userRateLimit.messageCount = 0;
  }
  
  // Update last message time
  userRateLimit.lastMessageTime = now;
  userRateLimit.messageCount += 1;
  
  // Store updated rate limit info
  messageRateLimits.set(userId, userRateLimit);
  
  // Return true if rate limited (more than 5 messages in 60 seconds)
  return userRateLimit.messageCount > 5;
};

// Add a new message
const addMessage = async (req, res) => {
  try {
    const { 
      chatId, 
      senderId, 
      text, 
      mediaType, 
      mediaUrl, 
      fileName, 
      fileSize, 
      replyTo,
      threadId, 
      formattingType 
    } = req.body;
    
    // Check rate limit
    if (checkRateLimit(senderId)) {
      return res.status(429).json({ message: "You're sending messages too quickly. Please wait a moment." });
    }
    
    // Extract mentions from text
    const mentionedUserIds = extractMentions(text);
    
    const message = new MessageModel({
      chatId,
      senderId,
      text,
      mediaType: mediaType || "none",
      mediaUrl: mediaUrl || "",
      fileName: fileName || "",
      fileSize: fileSize || 0,
      readBy: [senderId], // Sender has read the message
      mentions: mentionedUserIds,
      replyTo: replyTo || null,
      threadId: threadId || null,
      formattingType: formattingType || "plaintext"
    });
    
    const result = await message.save();
    
    // If this is a reply in a thread, update the thread
    if (threadId) {
      await ThreadModel.findByIdAndUpdate(threadId, {
        lastActivity: Date.now(),
        $inc: { messageCount: 1 },
        $addToSet: { participants: senderId }
      });
    }
    // If this is creating a new thread
    else if (replyTo && !threadId) {
      const parentMessage = await MessageModel.findById(replyTo);
      if (parentMessage) {
        // Create a new thread
        const thread = new ThreadModel({
          parentMessageId: replyTo,
          chatId: chatId,
          participants: [parentMessage.senderId, senderId],
          messageCount: 1
        });
        
        const savedThread = await thread.save();
        
        // Update this message with the new thread ID
        result.threadId = savedThread._id;
        await result.save();
      }
    }
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get messages for a chat
const getMessages = async (req, res) => {
  const { chatId } = req.params;
  const { limit = 50, before, threadId } = req.query;
  
  try {
    let query = { 
      chatId,
      isDeleted: { $ne: true }
    };
    
    // If threadId is provided, filter by thread
    if (threadId) {
      query.threadId = threadId;
    } else {
      // Only return messages not in a thread when no threadId is specified
      query.threadId = null;
    }
    
    // For pagination
    if (before) {
      query._id = { $lt: mongoose.Types.ObjectId(before) };
    }
    
    const result = await MessageModel.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .exec();
    
    // Sort by createdAt in ascending order for client
    result.sort((a, b) => a.createdAt - b.createdAt);
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark message as read
const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Add userId to readBy array if not already present
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
    }
    
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Edit a message
const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { text, userId, formattingType } = req.body;
    
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if user is the sender of the message
    if (message.senderId !== userId) {
      return res.status(403).json({ message: "You can only edit your own messages" });
    }
    
    // Save current text to edit history
    message.editHistory.push({
      text: message.text,
      editedAt: new Date()
    });
    
    // Extract mentions from new text
    const mentionedUserIds = extractMentions(text);
    
    // Update message
    message.text = text;
    message.isEdited = true;
    message.mentions = mentionedUserIds;
    if (formattingType) {
      message.formattingType = formattingType;
    }
    
    await message.save();
    
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body;
    
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if user is the sender of the message
    if (message.senderId !== userId) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }
    
    // Soft delete the message
    message.isDeleted = true;
    await message.save();
    
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a reaction to a message
const addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { emoji, userId } = req.body;
    
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
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
    
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Pin a message
const pinMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, channelId } = req.body;
    
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Toggle pin status
    message.isPinned = !message.isPinned;
    await message.save();
    
    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all pinned messages in a chat
const getPinnedMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const messages = await MessageModel.find({
      chatId,
      isPinned: true,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 });
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a thread from a message
const createThread = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId, title } = req.body;
    
    const message = await MessageModel.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }
    
    // Check if thread already exists
    let thread = await ThreadModel.findOne({ parentMessageId: messageId });
    
    if (thread) {
      return res.status(400).json({ 
        message: "Thread already exists for this message",
        threadId: thread._id
      });
    }
    
    // Create new thread
    thread = new ThreadModel({
      parentMessageId: messageId,
      chatId: message.chatId,
      participants: [message.senderId, userId],
      title: title || ""
    });
    
    const savedThread = await thread.save();
    
    // Update the original message to point to the thread
    message.threadId = savedThread._id;
    await message.save();
    
    res.status(201).json(savedThread);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get threads for a user
const getThreadsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const threads = await ThreadModel.find({
      participants: userId,
      isActive: true
    }).sort({ lastActivity: -1 });
    
    res.status(200).json(threads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search messages
const searchMessages = async (req, res) => {
  try {
    const { query, chatId, userId, startDate, endDate, hasMedia, limit = 20 } = req.body;
    
    let searchQuery = {
      isDeleted: { $ne: true }
    };
    
    // Filter by chat id if provided
    if (chatId) {
      searchQuery.chatId = chatId;
    }
    
    // Filter by user id if provided
    if (userId) {
      searchQuery.senderId = userId;
    }
    
    // Filter by date range if provided
    if (startDate || endDate) {
      searchQuery.createdAt = {};
      if (startDate) {
        searchQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        searchQuery.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Filter by media if requested
    if (hasMedia) {
      searchQuery.mediaType = { $ne: "none" };
    }
    
    // Text search if query provided
    if (query) {
      searchQuery.$text = { $search: query };
      // Or use regex for more flexible search
      // searchQuery.text = { $regex: query, $options: 'i' };
    }
    
    const messages = await MessageModel.find(searchQuery)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMessages,
  addMessage,
  markMessageAsRead,
  deleteMessage,
  editMessage,
  addReaction,
  pinMessage,
  getPinnedMessages,
  createThread,
  getThreadsForUser,
  searchMessages
};
