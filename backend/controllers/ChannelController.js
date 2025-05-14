const { ChannelModel, CategoryModel } = require("../models/ChannelModel");
const ServerModel = require("../models/ServerModel");

// Create a new channel
const createChannel = async (req, res) => {
  try {
    const { name, description, type, categoryId, serverId, isPrivate, permissions } = req.body;
    const userId = req.user[0]._id.toString();
    
    // Check if user has permission to create channels on this server
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user is server owner or has admin permissions
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    // Get user roles
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    // Check if user has permission to create channels
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageChannels);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to create channels" });
    }
    
    // Count existing channels to set order
    const channelCount = await ChannelModel.countDocuments({ serverId });
    
    // Create the new channel
    const newChannel = new ChannelModel({
      name,
      description: description || "",
      type: type || "text",
      categoryId: categoryId || null,
      order: channelCount,
      isPrivate: isPrivate || false,
      permissions: permissions || [],
      serverId
    });
    
    const savedChannel = await newChannel.save();
    res.status(201).json(savedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all channels for a server
const getServerChannels = async (req, res) => {
  try {
    const { serverId } = req.params;
    
    // Get all channels for this server
    const channels = await ChannelModel.find({ serverId }).sort({ order: 1 });
    
    // Get all categories for this server
    const categories = await CategoryModel.find({ serverId }).sort({ order: 1 });
    
    // Group channels by category
    const result = {
      categories,
      channels
    };
    
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a channel
const updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description, type, categoryId, isPrivate, permissions, order } = req.body;
    const userId = req.user[0]._id.toString();
    
    const channel = await ChannelModel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    
    // Check permissions
    const server = await ServerModel.findById(channel.serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user is server owner or has admin permissions
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    // Get user roles
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    // Check if user has permission to manage channels
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageChannels);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to manage channels" });
    }
    
    // Update channel
    if (name) channel.name = name;
    if (description !== undefined) channel.description = description;
    if (type) channel.type = type;
    if (categoryId !== undefined) channel.categoryId = categoryId;
    if (isPrivate !== undefined) channel.isPrivate = isPrivate;
    if (permissions) channel.permissions = permissions;
    if (order !== undefined) channel.order = order;
    
    const updatedChannel = await channel.save();
    res.status(200).json(updatedChannel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a channel
const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user[0]._id.toString();
    
    const channel = await ChannelModel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }
    
    // Check permissions
    const server = await ServerModel.findById(channel.serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user is server owner or has admin permissions
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    // Get user roles
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    // Check if user has permission to delete channels
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageChannels);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to delete channels" });
    }
    
    await ChannelModel.findByIdAndDelete(channelId);
    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a category
const createCategory = async (req, res) => {
  try {
    const { name, serverId } = req.body;
    const userId = req.user[0]._id.toString();
    
    // Check if user has permission to create categories on this server
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user is server owner or has admin permissions
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    // Get user roles
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    // Check if user has permission to create categories
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageChannels);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to create categories" });
    }
    
    // Count existing categories to set order
    const categoryCount = await CategoryModel.countDocuments({ serverId });
    
    // Create the new category
    const newCategory = new CategoryModel({
      name,
      order: categoryCount,
      serverId
    });
    
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a category
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, order, isCollapsed } = req.body;
    const userId = req.user[0]._id.toString();
    
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Check permissions
    const server = await ServerModel.findById(category.serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user is server owner or has admin permissions
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    // Get user roles
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    // Check if user has permission to manage categories
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageChannels);
                          });
    
    if (!hasPermission && isCollapsed === undefined) {
      return res.status(403).json({ message: "You don't have permission to manage categories" });
    }
    
    // Update category
    if (name) category.name = name;
    if (order !== undefined) category.order = order;
    if (isCollapsed !== undefined) category.isCollapsed = isCollapsed;
    
    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a category
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user[0]._id.toString();
    
    const category = await CategoryModel.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    // Check permissions
    const server = await ServerModel.findById(category.serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user is server owner or has admin permissions
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    // Get user roles
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    // Check if user has permission to delete categories
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageChannels);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to delete categories" });
    }
    
    // Remove category from channels
    await ChannelModel.updateMany(
      { categoryId: categoryId },
      { $set: { categoryId: null } }
    );
    
    await CategoryModel.findByIdAndDelete(categoryId);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reorder channels within a category
const reorderChannels = async (req, res) => {
  try {
    const { channelOrders } = req.body;
    const userId = req.user[0]._id.toString();
    
    if (!channelOrders || !Array.isArray(channelOrders)) {
      return res.status(400).json({ message: "Invalid channel order data" });
    }
    
    // Check if all channels exist and user has permission
    const channelIds = channelOrders.map(co => co.channelId);
    const channels = await ChannelModel.find({ _id: { $in: channelIds } });
    
    if (channels.length !== channelIds.length) {
      return res.status(404).json({ message: "One or more channels not found" });
    }
    
    // Check if all channels belong to the same server
    const serverId = channels[0].serverId;
    const allSameServer = channels.every(c => c.serverId === serverId);
    if (!allSameServer) {
      return res.status(400).json({ message: "Channels must belong to the same server" });
    }
    
    // Check if user has permission to reorder channels
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageChannels);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to reorder channels" });
    }
    
    // Update channel orders
    const updatePromises = channelOrders.map(({ channelId, order, categoryId }) => {
      const update = { order };
      if (categoryId !== undefined) {
        update.categoryId = categoryId;
      }
      
      return ChannelModel.findByIdAndUpdate(
        channelId,
        { $set: update },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    // Get updated channel list
    const updatedChannels = await ChannelModel.find({ serverId }).sort({ order: 1 });
    
    res.status(200).json(updatedChannels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createChannel,
  getServerChannels,
  updateChannel,
  deleteChannel,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderChannels
}; 