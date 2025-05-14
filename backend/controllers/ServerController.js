const ServerModel = require("../models/ServerModel");
const { ChannelModel, CategoryModel } = require("../models/ChannelModel");
const crypto = require("crypto");

// Create a new server
const createServer = async (req, res) => {
  try {
    const { name, description, iconUrl } = req.body;
    const ownerId = req.user[0]._id.toString();
    
    // Create the server
    const newServer = new ServerModel({
      name,
      description: description || "",
      iconUrl: iconUrl || "",
      ownerId,
      members: [{
        userId: ownerId,
        roles: [], // Will be populated with admin role after save
      }]
    });
    
    const savedServer = await newServer.save();
    
    // Add owner to the admin role
    const adminRole = savedServer.roles.find(r => r.name === "Admin");
    if (adminRole) {
      savedServer.members[0].roles.push(adminRole._id);
      await savedServer.save();
    }
    
    // Create default categories and channels
    const generalCategory = new CategoryModel({
      name: "Text Channels",
      order: 0,
      serverId: savedServer._id
    });
    
    const voiceCategory = new CategoryModel({
      name: "Voice Channels",
      order: 1,
      serverId: savedServer._id
    });
    
    const [savedGeneralCategory, savedVoiceCategory] = await Promise.all([
      generalCategory.save(),
      voiceCategory.save()
    ]);
    
    // Create default channels
    const generalChannel = new ChannelModel({
      name: "general",
      description: "General discussion",
      type: "text",
      categoryId: savedGeneralCategory._id,
      order: 0,
      serverId: savedServer._id
    });
    
    const welcomeChannel = new ChannelModel({
      name: "welcome",
      description: "Welcome new members",
      type: "text",
      categoryId: savedGeneralCategory._id,
      order: 1,
      serverId: savedServer._id
    });
    
    const generalVoice = new ChannelModel({
      name: "General Voice",
      type: "voice",
      categoryId: savedVoiceCategory._id,
      order: 0,
      serverId: savedServer._id
    });
    
    await Promise.all([
      generalChannel.save(),
      welcomeChannel.save(),
      generalVoice.save()
    ]);
    
    // Create an invite code
    const invite = {
      code: crypto.randomBytes(4).toString("hex"),
      createdBy: ownerId
    };
    
    savedServer.inviteCodes.push(invite);
    await savedServer.save();
    
    // Return the complete server with default channels
    const result = {
      server: savedServer,
      categories: [savedGeneralCategory, savedVoiceCategory],
      channels: [generalChannel, welcomeChannel, generalVoice],
      inviteCode: invite.code
    };
    
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all servers for a user
const getUserServers = async (req, res) => {
  try {
    const userId = req.user[0]._id.toString();
    
    const servers = await ServerModel.find({
      "members.userId": userId
    }).select("-inviteCodes");
    
    res.status(200).json(servers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get server details
const getServerDetails = async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.user[0]._id.toString();
    
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user is a member
    const isMember = server.members.some(m => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    // Get categories and channels
    const categories = await CategoryModel.find({ serverId }).sort({ order: 1 });
    const channels = await ChannelModel.find({ serverId }).sort({ order: 1 });
    
    res.status(200).json({
      server,
      categories,
      channels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update server details
const updateServer = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { name, description, iconUrl } = req.body;
    const userId = req.user[0]._id.toString();
    
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user is owner or has manage server permission
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageServer);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to manage this server" });
    }
    
    // Update server
    if (name) server.name = name;
    if (description !== undefined) server.description = description;
    if (iconUrl) server.iconUrl = iconUrl;
    
    const updatedServer = await server.save();
    res.status(200).json(updatedServer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a server
const deleteServer = async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.user[0]._id.toString();
    
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Only the owner can delete a server
    if (server.ownerId !== userId) {
      return res.status(403).json({ message: "Only the server owner can delete the server" });
    }
    
    // Delete all channels and categories
    await ChannelModel.deleteMany({ serverId });
    await CategoryModel.deleteMany({ serverId });
    
    // Delete the server
    await ServerModel.findByIdAndDelete(serverId);
    
    res.status(200).json({ message: "Server and all associated data deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create an invite code
const createInviteCode = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { maxUses, expiresIn } = req.body; // expiresIn in hours
    const userId = req.user[0]._id.toString();
    
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user has permission to create invites
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (
                              role.permissions.administrator || 
                              role.permissions.manageServer ||
                              role.permissions.manageChannels
                            );
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to create invite codes" });
    }
    
    // Create invite code
    const inviteCode = {
      code: crypto.randomBytes(4).toString("hex"),
      createdBy: userId,
      maxUses: maxUses || 0
    };
    
    // Set expiration if provided
    if (expiresIn) {
      const expiryTime = new Date();
      expiryTime.setHours(expiryTime.getHours() + Number(expiresIn));
      inviteCode.expiresAt = expiryTime;
    }
    
    server.inviteCodes.push(inviteCode);
    await server.save();
    
    res.status(201).json(inviteCode);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Join a server with invite code
const joinServer = async (req, res) => {
  try {
    const { inviteCode } = req.params;
    const userId = req.user[0]._id.toString();
    
    // Find server with this invite code
    const server = await ServerModel.findOne({
      "inviteCodes.code": inviteCode
    });
    
    if (!server) {
      return res.status(404).json({ message: "Invalid invite code" });
    }
    
    // Check if invite is expired
    const invite = server.inviteCodes.find(i => i.code === inviteCode);
    if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
      return res.status(400).json({ message: "Invite code has expired" });
    }
    
    // Check if max uses reached
    if (invite.maxUses > 0 && invite.uses >= invite.maxUses) {
      return res.status(400).json({ message: "Invite code has reached maximum uses" });
    }
    
    // Check if user is already a member
    const isMember = server.members.some(m => m.userId === userId);
    if (isMember) {
      return res.status(400).json({ message: "You are already a member of this server" });
    }
    
    // Add user to server
    const defaultRole = server.roles.find(r => r.isDefault);
    
    server.members.push({
      userId,
      roles: defaultRole ? [defaultRole._id] : []
    });
    
    // Increment invite uses
    invite.uses += 1;
    
    await server.save();
    
    // Get categories and channels
    const categories = await CategoryModel.find({ serverId: server._id }).sort({ order: 1 });
    const channels = await ChannelModel.find({ serverId: server._id }).sort({ order: 1 });
    
    res.status(200).json({
      server,
      categories,
      channels,
      message: `You have joined ${server.name}`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Leave a server
const leaveServer = async (req, res) => {
  try {
    const { serverId } = req.params;
    const userId = req.user[0]._id.toString();
    
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user is a member
    const memberIndex = server.members.findIndex(m => m.userId === userId);
    if (memberIndex === -1) {
      return res.status(400).json({ message: "You are not a member of this server" });
    }
    
    // Can't leave if you're the owner
    if (server.ownerId === userId) {
      return res.status(400).json({ message: "Server owner cannot leave. Please transfer ownership or delete the server." });
    }
    
    // Remove user from members
    server.members.splice(memberIndex, 1);
    await server.save();
    
    res.status(200).json({ message: `You have left ${server.name}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create or update a role
const manageRole = async (req, res) => {
  try {
    const { serverId } = req.params;
    const { roleId, name, color, permissions } = req.body;
    const userId = req.user[0]._id.toString();
    
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if user has permission to manage roles
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageRoles);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to manage roles" });
    }
    
    let role;
    
    // Update existing role
    if (roleId) {
      role = server.roles.id(roleId);
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      
      // Cannot modify @everyone role
      if (role.isDefault) {
        return res.status(400).json({ message: "Cannot modify the @everyone role" });
      }
      
      if (name) role.name = name;
      if (color) role.color = color;
      if (permissions) {
        Object.assign(role.permissions, permissions);
      }
    } 
    // Create new role
    else {
      const defaultPosition = server.roles.length > 0 ? 
        Math.max(...server.roles.map(r => r.position)) + 1 : 1;
      
      role = {
        name: name || "New Role",
        color: color || "#99AAB5",
        permissions: permissions || {
          viewChannels: true,
          sendMessages: true
        },
        position: defaultPosition,
        isDefault: false
      };
      
      server.roles.push(role);
    }
    
    await server.save();
    
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a role
const deleteRole = async (req, res) => {
  try {
    const { serverId, roleId } = req.params;
    const userId = req.user[0]._id.toString();
    
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if role exists
    const role = server.roles.id(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    // Cannot delete @everyone role
    if (role.isDefault) {
      return res.status(400).json({ message: "Cannot delete the @everyone role" });
    }
    
    // Check if user has permission to manage roles
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageRoles);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to manage roles" });
    }
    
    // Remove role from all members
    server.members.forEach(member => {
      member.roles = member.roles.filter(r => r.toString() !== roleId);
    });
    
    // Remove role from server
    server.roles.id(roleId).remove();
    
    await server.save();
    
    res.status(200).json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign role to a user
const assignRole = async (req, res) => {
  try {
    const { serverId, userId: targetUserId, roleId } = req.params;
    const userId = req.user[0]._id.toString();
    
    const server = await ServerModel.findById(serverId);
    if (!server) {
      return res.status(404).json({ message: "Server not found" });
    }
    
    // Check if role exists
    const role = server.roles.id(roleId);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    
    // Check if target user is a member
    const targetMember = server.members.find(m => m.userId === targetUserId);
    if (!targetMember) {
      return res.status(404).json({ message: "User is not a member of this server" });
    }
    
    // Check if user has permission to manage roles
    const member = server.members.find(m => m.userId === userId);
    if (!member) {
      return res.status(403).json({ message: "You are not a member of this server" });
    }
    
    const userRoles = member.roles || [];
    const serverRoles = server.roles || [];
    
    const hasPermission = server.ownerId === userId || 
                          userRoles.some(roleId => {
                            const role = serverRoles.find(r => r._id.toString() === roleId);
                            return role && (role.permissions.administrator || role.permissions.manageRoles);
                          });
    
    if (!hasPermission) {
      return res.status(403).json({ message: "You don't have permission to manage roles" });
    }
    
    // Toggle role assignment
    const hasRole = targetMember.roles.includes(roleId);
    if (hasRole) {
      targetMember.roles = targetMember.roles.filter(r => r.toString() !== roleId);
    } else {
      targetMember.roles.push(roleId);
    }
    
    await server.save();
    
    res.status(200).json({
      userId: targetUserId,
      roles: targetMember.roles,
      message: hasRole ? "Role removed" : "Role assigned"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createServer,
  getUserServers,
  getServerDetails,
  updateServer,
  deleteServer,
  createInviteCode,
  joinServer,
  leaveServer,
  manageRole,
  deleteRole,
  assignRole
}; 