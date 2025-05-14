import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Blog.css";

const BlogPosts = () => {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch blog posts on component mount
  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, [currentPage, selectedCategory, searchTerm]);

  // Fetch blog posts from API
  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:3000/blog?page=${currentPage}`;
      
      if (selectedCategory) {
        url += `&category=${selectedCategory}`;
      }
      
      if (searchTerm) {
        url += `&search=${searchTerm}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Failed to fetch blog posts");
      }
      
      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Fetch categories for filter
  const fetchCategories = async () => {
    try {
      // In a real app, you'd have an endpoint to get all categories
      // For now, we'll just collect unique categories from posts
      const response = await fetch("http://localhost:3000/blog");
      
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      
      const data = await response.json();
      const uniqueCategories = [...new Set(data.posts.flatMap(post => post.categories))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle category filter change
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page on category change
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Truncate text for preview
  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="blog-container">
      <div className="blog-header">
        <h1>Blog Posts</h1>
        {user && (
          <Link to="/blog/create" className="create-post-btn">
            <i className="fas fa-plus"></i> Create New Post
          </Link>
        )}
      </div>

      <div className="blog-filters">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          <button className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </div>

        <div className="category-filter">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPosts} className="retry-btn">
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="blog-posts-grid">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post._id} className="blog-post-card">
                  {post.featuredImage && (
                    <div className="post-image">
                      <img src={post.featuredImage} alt={post.title} />
                    </div>
                  )}
                  <div className="post-content">
                    <h2 className="post-title">{post.title}</h2>
                    <div className="post-meta">
                      <span className="post-date">{formatDate(post.createdAt)}</span>
                      <span className="post-author">By: {post.author}</span>
                    </div>
                    <p className="post-excerpt">
                      {truncateText(post.content)}
                    </p>
                    <div className="post-categories">
                      {post.categories.map((category, index) => (
                        <span key={index} className="category-tag">
                          {category}
                        </span>
                      ))}
                    </div>
                    <div className="post-footer">
                      <span className="post-views">
                        <i className="fas fa-eye"></i> {post.views} views
                      </span>
                      <span className="post-likes">
                        <i className="fas fa-heart"></i> {post.likes.length} likes
                      </span>
                      <Link to={`/blog/post/${post._id}`} className="read-more-btn">
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-posts-message">
                <p>No blog posts found. Try a different search or category.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <span className="page-info">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BlogPosts; 