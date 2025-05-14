import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Blog.css";

const CreateBlogPost = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState("published");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // New category and tag input states
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  
  // Common categories for selection (can be fetched from API in a real app)
  const commonCategories = [
    "Technology", "Programming", "Design", "Business", 
    "Marketing", "Health", "Travel", "Food"
  ];

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const postData = {
        title,
        content,
        categories,
        tags,
        featuredImage,
        status
      };
      
      const response = await fetch("http://localhost:3000/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to create blog post");
      }
      
      const data = await response.json();
      navigate(`/blog/post/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Add a new category
  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory("");
    }
  };

  // Remove a category
  const handleRemoveCategory = (category) => {
    setCategories(categories.filter(c => c !== category));
  };

  // Add a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  // Remove a tag
  const handleRemoveTag = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  // Handle image upload (in a real app, you'd upload to a server/CDN)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload the file and get a URL
      // Here we're just using a local URL for demo purposes
      setFeaturedImage(URL.createObjectURL(file));
    }
  };

  // If user is not logged in, redirect to login
  if (!user) {
    return (
      <div className="unauthorized">
        <h2>Unauthorized</h2>
        <p>You need to be logged in to create a blog post.</p>
        <Link to="/login" className="login-btn">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="create-post-container">
      <div className="page-header">
        <h1>Create New Blog Post</h1>
        <Link to="/blog" className="back-btn">
          <i className="fas fa-arrow-left"></i> Back to Blog
        </Link>
      </div>

      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter post title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog post content..."
            rows="15"
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Categories</label>
            <div className="tags-container">
              {categories.map((category, index) => (
                <div key={index} className="tag-item">
                  <span>{category}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveCategory(category)}
                    className="remove-tag"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="tag-input-container">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category"
              />
              <button 
                type="button" 
                onClick={handleAddCategory}
                className="add-tag-btn"
              >
                Add
              </button>
            </div>
            <div className="common-tags">
              <p>Suggested categories:</p>
              <div className="suggested-tags">
                {commonCategories.map((category, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      if (!categories.includes(category)) {
                        setCategories([...categories, category]);
                      }
                    }}
                    className="suggested-tag-btn"
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Tags</label>
            <div className="tags-container">
              {tags.map((tag, index) => (
                <div key={index} className="tag-item">
                  <span>#{tag}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-tag"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="tag-input-container">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
              />
              <button 
                type="button" 
                onClick={handleAddTag}
                className="add-tag-btn"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="featuredImage">Featured Image</label>
          <input
            type="file"
            id="featuredImage"
            accept="image/*"
            onChange={handleImageChange}
            className="file-input"
          />
          {featuredImage && (
            <div className="image-preview">
              <img src={featuredImage} alt="Preview" />
              <button 
                type="button" 
                onClick={() => setFeaturedImage("")}
                className="remove-image"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate("/blog")}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Post"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogPost; 