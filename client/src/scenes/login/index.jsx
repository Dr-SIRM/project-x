import React, { useContext, useState } from 'react';
import { Box, Typography, TextField, Button, Alert, useTheme } from '@mui/material';
import axios from 'axios';
import Header from "../../components/Header";
import { useNavigate } from 'react-router-dom';
import { tokens } from "../../theme";
import { AuthContext } from "../../AuthContext";


const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });

      // Save the session token or user information in local storage or state management
      // sessionStorage.setItem('token', response.data.session_token);
      // console.log(response.data.session_token);

      // Redirect to the dashboard
      navigate('/dashboard');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  return (
    <Box
    m="20px"
    justifyContent="center"
    alignItems="center"    
    >
    <Header title="Login" subtitle="" />
      <Box width="300px" p={2}>
        <form onSubmit={handleFormSubmit}>
          <Box mb={2}>
            <TextField
              type="email"
              label="Email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Box>
          <Box mb={2}>
            <TextField
              type="password"
              label="Password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          <Button type="submit" variant="contained" fullWidth>
            Login
          </Button>
          {error && (
            <Box mt={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
        </form>
      </Box>
    </Box>
  );
};

export default Login;
