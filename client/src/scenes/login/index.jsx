import React, { useContext, useState } from 'react';
import { Box, Typography, TextField, Button, Alert, useTheme, Link } from '@mui/material';
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
      await login(email, password);
    } catch (error) {
      setError('error.message');
    }
  };

  return (
    <Box
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center" 
    minHeight="100vh"
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
          <Box></Box>
          <Box mb={2}>
            <Typography>
              <Link href="/forget_password" style={{ textDecoration: 'none', color: 'inherit' }}>
                Forgot Password
              </Link>
            </Typography>
          </Box>
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
