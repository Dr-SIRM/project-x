import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate  } from 'react-router-dom';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const login = async (email, password) => {
    try {
      console.log('Email:', email, 'Password:', password);
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Server response:', data);
      setUser( data.user );
      localStorage.setItem('session_token', data.session_token);
      localStorage.setItem('user', JSON.stringify(data.user));
  } catch (error) {
    setError('Invalid email or password');
  }
};

  useEffect(() => {
    if (user) {
      console.log('User after login:', user);
      console.log('Session token after login:', localStorage.getItem('session_token'));
      navigate('/dashboard');
    } else {
      console.log('Back to Login');
    }  
  }, [user]); // This useEffect hook logs the value of 'user' whenever it changes

  const logout = () => {
    // Clear user data and access token from localStorage
    setUser(null);
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
