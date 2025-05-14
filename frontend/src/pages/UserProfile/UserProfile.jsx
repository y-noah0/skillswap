import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './UserProfile.css';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch user data
        const userResponse = await fetch(`http://localhost:3000/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const userData = await userResponse.json();
        setUser(userData);
        
        // Fetch user skills
        const skillsResponse = await fetch(`http://localhost:3000/skill/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          setSkills(skillsData);
        }
        
        // Fetch user's recent blog posts
        const blogsResponse = await fetch(`http://localhost:3000/blog/user/${userId}?limit=3`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (blogsResponse.ok) {
          const blogsData = await blogsResponse.json();
          setRecentBlogs(blogsData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [userId]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-container">
        <div className="error">
          <h2>Error loading profile</h2>
          <p>{error || 'User not found'}</p>
          <Link to="/" className="button">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.profileImage ? (
            <img src={user.profileImage} alt={`${user.firstname} ${user.lastname}`} />
          ) : (
            <div className="avatar-placeholder">
              {user.firstname?.[0]}{user.lastname?.[0]}
            </div>
          )}
        </div>
        <div className="profile-info">
          <h1>{user.firstname} {user.lastname}</h1>
          <p className="username">@{user.username}</p>
          {user.bio && <p className="bio">{user.bio}</p>}
          <div className="profile-stats">
            <div className="stat">
              <span className="stat-value">{skills.length}</span>
              <span className="stat-label">Skills</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user.followers?.length || 0}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-value">{user.following?.length || 0}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
          
          {currentUser && currentUser._id !== userId && (
            <button className="follow-button">
              {user.followers?.includes(currentUser._id) ? 'Unfollow' : 'Follow'}
            </button>
          )}
          
          {currentUser && currentUser._id === userId && (
            <Link to="/dashboard" className="edit-profile-button">
              Edit Profile
            </Link>
          )}
        </div>
      </div>
      
      <div className="profile-content">
        <div className="profile-section">
          <h2>Skills</h2>
          {skills.length > 0 ? (
            <div className="skills-list">
              {skills.map(skill => (
                <div key={skill._id} className="skill-item">
                  <span className="skill-name">{skill.name}</span>
                  <div className="skill-level">
                    <div 
                      className="skill-level-bar" 
                      style={{ width: `${(skill.level / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="skill-level-text">
                    {['Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'][skill.level - 1]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-content">No skills added yet.</p>
          )}
        </div>
        
        <div className="profile-section">
          <h2>Recent Activity</h2>
          {recentBlogs.length > 0 ? (
            <div className="recent-blogs">
              {recentBlogs.map(blog => (
                <div key={blog._id} className="blog-card">
                  {blog.coverImage && (
                    <img src={blog.coverImage} alt={blog.title} className="blog-cover" />
                  )}
                  <div className="blog-content">
                    <h3 className="blog-title">
                      <Link to={`/blog/post/${blog._id}`}>{blog.title}</Link>
                    </h3>
                    <p className="blog-excerpt">
                      {blog.content.substring(0, 100)}
                      {blog.content.length > 100 ? '...' : ''}
                    </p>
                    <div className="blog-meta">
                      <span className="blog-date">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                      <span className="blog-comments">
                        {blog.comments?.length || 0} comments
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              
              <Link to={`/blog/user/${userId}`} className="view-all-link">
                View all posts →
              </Link>
            </div>
          ) : (
            <p className="no-content">No blog posts yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 