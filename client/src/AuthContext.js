import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate  } from 'react-router-dom';
import { API_BASE_URL } from "./config";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');


  // const checkTokenExpiration = () => {
  //   const lastActivity = localStorage.getItem('last_activity');
  //   const sessionToken = localStorage.getItem('session_token');
  
  //   // Proceed only if both session token and last activity are present
  //   if (sessionToken && lastActivity) {
  //     const lastActivityDate = new Date(lastActivity);
  //     const now = new Date();
  //     const difference = now - lastActivityDate;
  //     const differenceInMinutes = Math.floor(difference / 1000 / 60);
  
  //     if (differenceInMinutes >= 60) {
  //       localStorage.removeItem('session_token');
  //       localStorage.removeItem('last_activity');
  //       localStorage.removeItem('user');
  //       setUser(null);
  //       navigate('/login');
  //     }
  //   }
  // };

  // useEffect(() => {
  //   checkTokenExpiration();

  //   const storedUser = localStorage.getItem('user');
  //   if (storedUser) {
  //     setUser(JSON.parse(storedUser));
  //   }
  // }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('last_activity', new Date().toString());
      navigate('/login');
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
      if (data.session_token) {
        localStorage.setItem('session_token', data.session_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);  // Set user here only after token validation
      } else {
        throw new Error('Token not received');
      }
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('session_token');
      const response = await fetch(`${API_BASE_URL}/api/token/refresh`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${refreshToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log('Refresh Token:', response);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      if (data.session_token) {
        localStorage.setItem('session_token', data.session_token);
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Handle token refresh failure (e.g., redirect to login)
      logout(); // Logout the user if token refresh fails
    }
  };

  useEffect(() => {
    const handleRefreshToken = async () => {
      try {
        await refreshAccessToken(); // Call the refresh token function
      } catch (error) {
        console.error("Token refresh failed:", error);
      }
    };
  
    const handleLogout = () => {
      logout();
    };
  
    window.addEventListener("refreshToken", handleRefreshToken);
    window.addEventListener("logout", handleLogout);
  
    return () => {
      window.removeEventListener("refreshToken", handleRefreshToken);
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('session_token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setUser(JSON.parse(storedUser));  // Initialize the user state
    }
  }, []);

  // useEffect(() => {
  //   const interval = setInterval(checkTokenExpiration, 1000 * 60); // Check every minute
  //   return () => clearInterval(interval); // Clear interval on unmount
  // }, []); 

  useEffect(() => {
    if (user) {
      console.log('User after login:', user);
      console.log('Session token after login:', localStorage.getItem('session_token'));
      navigate('/welcome');
    } else {
      console.log('Back to Login');
    }  
  }, [user]); // This useEffect hook logs the value of 'user' whenever it changes

  const logout = () => {
    setUser(null);
    localStorage.removeItem('session_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const updateUserActivity = () => {
    if (user) {
      localStorage.setItem('last_activity', new Date().toString());
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError, updateUserActivity, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
