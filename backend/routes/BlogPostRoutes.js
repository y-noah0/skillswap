const express = require("express");
const router = express.Router();
const {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  addComment,
  likePost,
  getUserBlogPosts
} = require("../controllers/BlogPostController");
const { authanticateJwt } = require("../controllers/userControllers");

// Public routes
router.get("/", getAllBlogPosts);
router.get("/:postId", getBlogPostById);
router.get("/user/:userId", getUserBlogPosts);

// Protected routes
router.post("/", authanticateJwt, createBlogPost);
router.put("/:postId", authanticateJwt, updateBlogPost);
router.delete("/:postId", authanticateJwt, deleteBlogPost);
router.post("/:postId/comments", authanticateJwt, addComment);
router.post("/:postId/like", authanticateJwt, likePost);

module.exports = router; 