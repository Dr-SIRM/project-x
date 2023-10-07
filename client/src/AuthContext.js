import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import { API_BASE_URL } from "./config";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');


  const checkTokenExpiration = () => {
    const lastActivity = new Date(localStorage.getItem('last_activity'));
    const now = new Date();
    const difference = now - lastActivity;
    const differenceInMinutes = Math.floor(difference / 1000 / 60);

    if (differenceInMinutes >= 15) {
      localStorage.removeItem('session_token');
      localStorage.removeItem('last_activity');
      localStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  useEffect(() => {
    checkTokenExpiration();

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('last_activity', new Date().toString());
      navigate('/dashboard');
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      console.log('Email:', email, 'Password:', password);
      const response = await fetch(`${API_BASE_URL}/api/login`, {
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
      setUser(data.user);
      localStorage.setItem('session_token', data.session_token);
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('session_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));  // Initialize the user state
    }
  }, []);

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
    setUser(null);
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
