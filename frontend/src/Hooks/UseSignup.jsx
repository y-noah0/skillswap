import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export const useSignUp = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useContext(AuthContext);

  const signUp = async ({
    username,
    first_name,
    last_name,
    email,
    password,
    skill,
    desired_skill,
  }) => {
    setIsLoading(true);
    setError(null);
  
    try {
      console.log("Attempting sign-up with:", {
        username,
        first_name,
        last_name,
        email,
        skill,
        desired_skill,
      }); // Debug line to show sent data
  
      const response = await fetch("http://localhost:3000/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          first_name,   // Corrected key
          last_name,    // Corrected key
          email,
          password,
          skill,
          desired_skill, // Corrected key
        }),
      });
  
      const json = await response.json();
      console.log("Response data:", json);
  
      if (!response.ok) {
        setIsLoading(false);
        setError(json.error || "Sign-up failed");
      } else {
        localStorage.setItem("user", JSON.stringify(json));
        dispatch({ type: "LOGIN", payload: json });
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Sign-up error:", err); // Log unexpected errors
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return { signUp, error, isLoading };
};