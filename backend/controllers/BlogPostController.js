const BlogPostModel = require("../models/BlogPostModel");

// Create a new blog post
const createBlogPost = async (req, res) => {
  try {
    const { title, content, tags, categories, featuredImage, status } = req.body;
    const author = req.user[0]._id.toString(); // Convert to string for consistency
    
    const newBlogPost = new BlogPostModel({
      title,
      content,
      author,
      tags: tags || [],
      categories: categories || [],
      featuredImage: featuredImage || "",
      status: status || "published"
    });
    
    const savedBlogPost = await newBlogPost.save();
    res.status(201).json(savedBlogPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all published blog posts with pagination
const getAllBlogPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search } = req.query;
    
    const query = { status: "published" };
    
    // Filter by category if provided
    if (category) {
      query.categories = category;
    }
    
    // Filter by tag if provided
    if (tag) {
      query.tags = tag;
    }
    
    // Search in title or content if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }
    
    const posts = await BlogPostModel.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .exec();
    
    const totalPosts = await BlogPostModel.countDocuments(query);
    
    res.status(200).json({
      posts,
      totalPages: Math.ceil(totalPosts / parseInt(limit)),
      currentPage: parseInt(page),
      totalPosts
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single blog post by ID
const getBlogPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await BlogPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    // Increment view count
    post.views += 1;
    await post.save();
    
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a blog post
const updateBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, tags, categories, featuredImage, status } = req.body;
    const userId = req.user[0]._id.toString(); // Convert to string for comparison
    
    const post = await BlogPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    // Check if user is the author of the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "You can only update your own posts" });
    }
    
    // Update fields that are provided
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;
    if (categories) post.categories = categories;
    if (featuredImage) post.featuredImage = featuredImage;
    if (status) post.status = status;
    
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a blog post
const deleteBlogPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user[0]._id.toString(); // Convert to string for comparison
    
    const post = await BlogPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    // Check if user is the author of the post
    if (post.author.toString() !== userId) {
      return res.status(403).json({ message: "You can only delete your own posts" });
    }
    
    await BlogPostModel.findByIdAndDelete(postId);
    res.status(200).json({ message: "Blog post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a comment to a blog post
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user[0]._id.toString(); // Convert to string for consistency
    
    const post = await BlogPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    const newComment = {
      userId,
      content,
      likes: []
    };
    
    post.comments.push(newComment);
    const updatedPost = await post.save();
    
    res.status(201).json({
      comment: updatedPost.comments[updatedPost.comments.length - 1],
      message: "Comment added successfully"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like a blog post
const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user[0]._id.toString(); // Convert to string for comparison
    
    const post = await BlogPostModel.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Blog post not found" });
    }
    
    // Check if user already liked the post
    const alreadyLiked = post.likes.includes(userId);
    
    if (alreadyLiked) {
      // Remove like if already liked
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      // Add like if not liked yet
      post.likes.push(userId);
    }
    
    const updatedPost = await post.save();
    res.status(200).json({
      likes: updatedPost.likes,
      message: alreadyLiked ? "Post unliked" : "Post liked"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all blog posts by user
const getUserBlogPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status = "published" } = req.query;
    
    const posts = await BlogPostModel.find({
      author: userId,
      status
    }).sort({ createdAt: -1 });
    
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBlogPost,
  getAllBlogPosts,
  getBlogPostById,
  updateBlogPost,
  deleteBlogPost,
  addComment,
  likePost,
  getUserBlogPosts
}; 