import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Auth/Login/Login";
import SignUp from "./Components/Auth/signUp/SignUp";
import Home from "./pages/Home/Home";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard/Dashboard";
import Chat from "./pages/Chat/Chat";
import BlogPosts from "./pages/Blog/BlogPosts";
import BlogPost from "./pages/Blog/BlogPost";
import CreateBlogPost from "./pages/Blog/CreateBlogPost";
import EditBlogPost from "./pages/Blog/EditBlogPost";
import UserProfile from "./pages/UserProfile/UserProfile";

function App() {
  const { user } = useContext(AuthContext);
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Home /> : <Navigate to="/login" />} 
        />
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!user ? <SignUp /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route 
          path="/chat"
          element={user ? <Chat /> : <Navigate to="/login" />}
        />
        <Route 
          path="/blog"
          element={<BlogPosts />}
        />
        <Route 
          path="/blog/post/:postId"
          element={<BlogPost />}
        />
        <Route 
          path="/blog/create"
          element={user ? <CreateBlogPost /> : <Navigate to="/login" />}
        />
        <Route 
          path="/blog/edit/:postId"
          element={user ? <EditBlogPost /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile/:userId"
          element={<UserProfile />}
        />
      </Routes>
    </Router>
  );
}

export default App;
