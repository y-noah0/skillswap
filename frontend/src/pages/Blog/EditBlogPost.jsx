import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Blog.css";

const EditBlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState("published");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // New category and tag input states
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  
  // Common categories for selection (can be fetched from API in a real app)
  const commonCategories = [
    "Technology", "Programming", "Design", "Business", 
    "Marketing", "Health", "Travel", "Food"
  ];

  // Fetch post data when component mounts
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`http://localhost:3000/blog/${postId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch blog post");
        }
        
        const data = await response.json();
        
        // Populate form fields with existing data
        setTitle(data.title);
        setContent(data.content);
        setCategories(data.categories || []);
        setTags(data.tags || []);
        setFeaturedImage(data.featuredImage || "");
        setStatus(data.status || "published");
        setLoading(false);
        
        // Check if user is the author
        if (user && data.author !== user._id.toString()) {
          // If not the author, redirect to view page
          navigate(`/blog/post/${postId}`);
        }
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    if (postId) {
      fetchPost();
    }
  }, [postId, user, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }
    
    setSubmitting(true);
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
      
      const response = await fetch(`http://localhost:3000/blog/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
        },
        body: JSON.stringify(postData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update blog post");
      }
      
      // Redirect to view updated post
      navigate(`/blog/post/${postId}`);
    } catch (error) {
      setError(error.message);
      setSubmitting(false);
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
        <p>You need to be logged in to edit a blog post.</p>
        <Link to="/login" className="login-btn">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="edit-post-container">
      <div className="page-header">
        <h1>Edit Blog Post</h1>
        <Link to={`/blog/post/${postId}`} className="back-btn">
          <i className="fas fa-arrow-left"></i> Back to Post
        </Link>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-alert">
          <p>{error}</p>
          <Link to="/blog" className="back-btn">
            Back to Blog
          </Link>
        </div>
      ) : (
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
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate(`/blog/post/${postId}`)}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditBlogPost; 