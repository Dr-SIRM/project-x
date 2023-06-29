import React, { createContext, useContext, useState } from 'react';
import { useNavigate  } from 'react-router-dom';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    try {
      // Send login request to the backend and handle the response
      // Upon successful login, set the user data and redirect to the dashboard
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('access_token', data.access_token);
        navigate('/dashboard');
      } else {
        // Handle login error
        console.log('Login failed');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    // Clear user data and access token from localStorage
    setUser(null);
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;