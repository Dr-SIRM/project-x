import React, { useContext } from 'react';
import { Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if user is not authenticated
  }

  return <Route {...rest} element={<Component />} />;
};

export default PrivateRoute;