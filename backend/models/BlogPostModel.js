const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: [{
    type: String // User IDs who liked the comment
  }]
}, { timestamps: true });

const BlogPostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: {
    type: String, // User ID
    required: true
  },
  featuredImage: {
    type: String, // URL to the image
    default: ""
  },
  tags: [{
    type: String
  }],
  categories: [{
    type: String
  }],
  likes: [{
    type: String // User IDs who liked the post
  }],
  views: {
    type: Number,
    default: 0
  },
  comments: [CommentSchema],
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "published"
  }
}, { timestamps: true });

const BlogPostModel = mongoose.model("BlogPost", BlogPostSchema);

module.exports = BlogPostModel; 