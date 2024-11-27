import React from "react";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import Hero from "../../Components/Hero/Hero";
import Features from "../Features/Features";
import style from "./Home.module.css";
import Navigation from "../../Components/Defaults/Navigation/Navigation";
import Dashboard from "../Dashboard/Dashboard";

const Home = () => {
  const { user } = useContext(AuthContext);

  return (
    <>
      {user ? (
        // Authenticated user view
        <div className={style.authenticatedContainer}>
          <Navigation />
          <Dashboard />
        </div>
      ) : (
        // Non-authenticated user view
        <>
          <div className={style.top}>
            <Navigation />
            <Hero />
          </div>
          <Features />
        </>
      )}
    </>
  );
};

export default Home;