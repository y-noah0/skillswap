import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useState } from "react";




export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(null);
    const { dispatch } = useContext(AuthContext);
  
    const login = async (email, password) => {
      setIsLoading(true);
      setError(null);
  
      try {
        
        const response = await fetch('http://127.0.0.1:5000/api/user/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
  
        const json = await response.json();

        if (!response.ok) {
          setIsLoading(false);
          setError(json.error || 'login failed');
        } else {
          localStorage.setItem('user', JSON.stringify(json));
          dispatch({ type: 'LOGIN', payload: json });
          setIsLoading(false);
        }
      } catch (err) {
        console.error('login error:', err); // Log unexpected errors
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    };
  
    return { login, error, isLoading };
  };
  
