import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Auth/Login/Login";
import SignUp from "./Components/Auth/signUp/SignUp";
import Home from "./pages/Home/Home";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

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
      </Routes>
    </Router>
  );
}

export default App;
