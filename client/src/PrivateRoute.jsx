import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ component: Component, accessLevels=[], ...rest }) => {
  const { user } = useContext(AuthContext);

  console.log('User in PrivateRoute:', user); // Print the user state
  console.log('Session token in PrivateRoute:', localStorage.getItem('session_token'));

  if (!user) {
    console.log('User not authenticated in PrivateRoute');
    return <Navigate to="/login" />; // Redirect to login if user is not authenticated
  }

  if (!accessLevels.includes(user.access_level)) {
    return <Navigate to="/login" />; // Redirect to unauthorized page if user's access level is not in the list
  }

  return <Component {...rest} />;
};

export default PrivateRoute;