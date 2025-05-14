const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RoleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "#99AAB5", // Default Discord role color
  },
  permissions: {
    administrator: {
      type: Boolean,
      default: false,
    },
    manageServer: {
      type: Boolean,
      default: false,
    },
    manageChannels: {
      type: Boolean,
      default: false,
    },
    manageRoles: {
      type: Boolean,
      default: false,
    },
    manageMessages: {
      type: Boolean,
      default: false,
    },
    viewChannels: {
      type: Boolean,
      default: true,
    },
    sendMessages: {
      type: Boolean,
      default: true,
    },
    embedLinks: {
      type: Boolean,
      default: true,
    },
    attachFiles: {
      type: Boolean,
      default: true,
    },
    mentionEveryone: {
      type: Boolean,
      default: false,
    },
    useVoice: {
      type: Boolean,
      default: true,
    },
  },
  position: {
    type: Number,
    default: 0,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const ServerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    iconUrl: {
      type: String,
      default: "",
    },
    ownerId: {
      type: String,
      required: true,
    },
    members: [{
      userId: {
        type: String,
        required: true,
      },
      nickname: {
        type: String,
        default: "",
      },
      roles: [{
        type: String, // Role IDs
      }],
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    roles: [RoleSchema],
    inviteCodes: [{
      code: {
        type: String,
        required: true,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
      maxUses: {
        type: Number,
        default: 0, // 0 means unlimited
      },
      uses: {
        type: Number,
        default: 0,
      },
      createdBy: {
        type: String, // User ID
        required: true,
      },
    }],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Pre-save hook to update the updatedAt field
ServerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create a default role when creating a server
ServerSchema.pre('save', function(next) {
  if (this.isNew && !this.roles.length) {
    // Create @everyone role
    this.roles.push({
      name: '@everyone',
      color: '#99AAB5',
      permissions: {
        viewChannels: true,
        sendMessages: true,
        embedLinks: true,
        attachFiles: true,
        useVoice: true,
      },
      position: 0,
      isDefault: true,
    });
    
    // Create admin role for server owner
    this.roles.push({
      name: 'Admin',
      color: '#E74C3C',
      permissions: {
        administrator: true,
        manageServer: true,
        manageChannels: true,
        manageRoles: true,
        manageMessages: true,
        viewChannels: true,
        sendMessages: true,
        embedLinks: true,
        attachFiles: true,
        mentionEveryone: true,
        useVoice: true,
      },
      position: 1,
      isDefault: false,
    });
  }
  next();
});

const ServerModel = mongoose.model("Server", ServerSchema);

module.exports = ServerModel; 