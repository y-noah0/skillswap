import { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Blog.css";

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  // Fetch post data when component mounts
  useEffect(() => {
    fetchPost();
  }, [postId]);

  // Check if user has liked the post
  useEffect(() => {
    if (post && user) {
      setIsLiked(post.likes.includes(user._id));
    }
  }, [post, user]);

  // Fetch post data from API
  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/blog/${postId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch blog post");
      }
      
      const data = await response.json();
      setPost(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
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

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!comment.trim() || !user) return;
    
    try {
      const response = await fetch(`http://localhost:3000/blog/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
        },
        body: JSON.stringify({ content: comment }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit comment");
      }
      
      // Refresh post data to show new comment
      await fetchPost();
      setComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment. Please try again.");
    }
  };

  // Handle like/unlike post
  const handleLikePost = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/blog/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add auth headers if needed
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to like/unlike post");
      }
      
      // Update local state to reflect change
      setIsLiked(!isLiked);
      setPost({
        ...post,
        likes: isLiked
          ? post.likes.filter(id => id !== user._id)
          : [...post.likes, user._id]
      });
    } catch (error) {
      console.error("Error liking/unliking post:", error);
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:3000/blog/${postId}`, {
        method: "DELETE",
        headers: {
          // Add auth headers if needed
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
      
      // Redirect to blog list
      navigate("/blog");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  return (
    <div className="blog-post-container">
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchPost} className="retry-btn">
            Retry
          </button>
        </div>
      ) : post ? (
        <>
          <div className="blog-post-header">
            <Link to="/blog" className="back-to-blog">
              <i className="fas fa-arrow-left"></i> Back to All Posts
            </Link>
            {user && post.author === user._id.toString() && (
              <div className="post-actions">
                <Link to={`/blog/edit/${postId}`} className="edit-post-btn">
                  <i className="fas fa-edit"></i> Edit
                </Link>
                <button onClick={handleDeletePost} className="delete-post-btn">
                  <i className="fas fa-trash"></i> Delete
                </button>
              </div>
            )}
          </div>

          <article className="blog-post">
            <h1 className="post-title">{post.title}</h1>
            
            <div className="post-meta">
              <span className="post-date">
                <i className="far fa-calendar"></i> {formatDate(post.createdAt)}
              </span>
              <span className="post-author">
                <i className="far fa-user"></i> By: {post.author}
              </span>
              <span className="post-views">
                <i className="far fa-eye"></i> {post.views} views
              </span>
            </div>
            
            {post.categories.length > 0 && (
              <div className="post-categories">
                {post.categories.map((category, index) => (
                  <span key={index} className="category-tag">
                    {category}
                  </span>
                ))}
              </div>
            )}
            
            {post.featuredImage && (
              <div className="post-featured-image">
                <img src={post.featuredImage} alt={post.title} />
              </div>
            )}
            
            <div className="post-content">
              {/* In a real app, you might need to sanitize HTML or use a Markdown renderer */}
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </div>
            
            <div className="post-footer">
              <div className="post-tags">
                {post.tags.map((tag, index) => (
                  <span key={index} className="tag">#{tag}</span>
                ))}
              </div>
              
              <div className="post-actions">
                <button 
                  className={`like-button ${isLiked ? 'liked' : ''}`} 
                  onClick={handleLikePost}
                >
                  <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
                  <span>{post.likes.length} Likes</span>
                </button>
              </div>
            </div>
          </article>

          <section className="comments-section">
            <h2>Comments ({post.comments.length})</h2>
            
            {user ? (
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
                <button type="submit" className="submit-comment-btn">
                  Post Comment
                </button>
              </form>
            ) : (
              <div className="login-to-comment">
                <p>Please <Link to="/login">login</Link> to leave a comment.</p>
              </div>
            )}
            
            <div className="comments-list">
              {post.comments.length > 0 ? (
                post.comments.map((comment, index) => (
                  <div key={index} className="comment">
                    <div className="comment-header">
                      <div className="comment-author">
                        {/* In a real app, you'd fetch user details */}
                        <div className="avatar small">{comment.userId.substring(0, 2)}</div>
                        <span>{comment.userId}</span>
                      </div>
                      <div className="comment-date">
                        {formatDate(comment.createdAt)}
                      </div>
                    </div>
                    <div className="comment-content">
                      <p>{comment.content}</p>
                    </div>
                    <div className="comment-footer">
                      <button className="like-comment-btn">
                        <i className="far fa-heart"></i> {comment.likes.length}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-comments">
                  <p>No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <div className="not-found">
          <h2>Post not found</h2>
          <p>The blog post you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="back-to-blog">
            Back to All Posts
          </Link>
        </div>
      )}
    </div>
  );
};

export default BlogPost; 