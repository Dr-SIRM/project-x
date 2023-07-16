import React, { useContext, useState } from 'react';
import { Box, Typography, TextField, Button, Alert, useTheme, Link, CircularProgress } from '@mui/material';
import Header from "../../components/Header";
import { useNavigate } from 'react-router-dom';
import { tokens } from "../../theme";
import { AuthContext } from "../../AuthContext";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // New loading state
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true); // Set loading state to true
      await login(email, password);
      setTimeout(() => {
        navigate('/dashboard'); // Navigate after 2 seconds
      }, 5000);
    } catch (error) {
      setError(error.message);
      setLoading(false); // Set loading state to false if there's an error
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
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? (
              <CircularProgress size={24} color="inherit" /> 
            ) : (
              'Login'
            )}
          </Button>
          {error && (
            <Box mt={2}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}
          <Box mb={2} mt={2}>
            <Typography variant="body2" style={{ fontStyle: 'cursive' }}>
              <Link href="/forget_password" style={{ textDecoration: 'none', color: 'inherit' }}>
                Forgot Password?
              </Link>
            </Typography>
          </Box>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
