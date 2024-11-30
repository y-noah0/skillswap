import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useState } from "react";

export const UseLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useContext(AuthContext);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/user/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

if (response.ok) {
  const userData = json.user; // or whatever property contains the user data
  localStorage.setItem('user', JSON.stringify(userData));
  dispatch({ type: 'LOGIN', payload: userData });
  setIsLoading(false);
} else {
  setIsLoading(false);
  setError(json.error || 'Login failed');
}
    } catch (err) {
      // Handle unexpected errors
      console.error('Login error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { login, error, isLoading };
};


