import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ component: Component, accessLevel, ...rest }) => {
  const { user } = useContext(AuthContext);

  console.log('User in PrivateRoute:', user); // Print the user state
  console.log('Session token in PrivateRoute:', localStorage.getItem('session_token'));

  if (!user) {
    console.log('User not authenticated in PrivateRoute');
    return <Navigate to="/login" />; // Redirect to login if user is not authenticated
  }

  if (user.access_level !== accessLevel) {
    return <Navigate to="/login" />; // Redirect to unauthorized page if user's access level is not sufficient
  }

  return <Component {...rest} />;
};

export default PrivateRoute;