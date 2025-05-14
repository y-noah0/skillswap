const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PermissionSchema = new Schema({
  userId: {
    type: String,
  },
  roleId: {
    type: String,
  },
  canRead: {
    type: Boolean,
    default: true,
  },
  canWrite: {
    type: Boolean,
    default: true,
  },
  canManage: {
    type: Boolean,
    default: false,
  },
  canInvite: {
    type: Boolean,
    default: false,
  },
  canDelete: {
    type: Boolean,
    default: false,
  },
  canPin: {
    type: Boolean,
    default: false,
  },
});

const ChannelSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    type: {
      type: String,
      enum: ["text", "voice", "announcement", "rules"],
      default: "text",
    },
    categoryId: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    permissions: [PermissionSchema],
    serverId: {
      type: String, // Equivalent to a Discord server
      required: true,
    },
    defaultRolePermissions: {
      canRead: {
        type: Boolean,
        default: true,
      },
      canWrite: {
        type: Boolean,
        default: true,
      },
      canManage: {
        type: Boolean,
        default: false,
      },
      canInvite: {
        type: Boolean,
        default: false,
      },
      canDelete: {
        type: Boolean,
        default: false,
      },
      canPin: {
        type: Boolean,
        default: false,
      },
    },
    slowMode: {
      isEnabled: {
        type: Boolean,
        default: false,
      },
      delay: {
        type: Number, // Delay in seconds
        default: 0,
      },
    },
    pinnedMessages: [{
      type: String, // Message IDs
    }],
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    serverId: {
      type: String,
      required: true,
    },
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const ChannelModel = mongoose.model("Channel", ChannelSchema);
const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = {
  ChannelModel,
  CategoryModel,
}; 