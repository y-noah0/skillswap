import { Routes, Route } from "react-router-dom";
import Navigation from "./Components/Defaults/Navigation/Navigation";
import Hero from "./Components/Hero/Hero";
import Login from "./Components/Auth/Login/Login";
import SignUp from "./Components/Auth/signUp/SignUp";
import "./App.css";
import Features from "./pages/Features/Features";

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route
          path="/"
          element={
            <div className="top">
              <Hero />
              <Features />
            </div>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </>
  );
}

export default App;
