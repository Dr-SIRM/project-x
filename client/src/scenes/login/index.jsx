import React, { useContext, useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Alert, useTheme, Link, CircularProgress } from '@mui/material';
import Header from "../../components/Header";
import { useNavigate } from 'react-router-dom';
import { tokens } from "../../theme";
import { AuthContext } from "../../AuthContext";
import { API_BASE_URL } from "../../config";

const Login = () => {
  const { login, error, setError } = useContext(AuthContext); // Fetch error and setError from the context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    if (error) {
      setShowErrorNotification(true);
    }
  }, [error]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      await login(email, password);
      setTimeout(() => {
        navigate('/dashboard'); 
      }, 2000);
    } catch (error) {
      setError('Invalid email or password');
      setLoading(false);
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
      <Button
      variant="contained"
      href="http://localhost:5173/landing-page"
      style={{
        position: 'absolute',
        top: '10px',
        right: '10px'
      }}
    >
      Zurück
    </Button>
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
              <Link href="/forget_password" style={{ textDecoration: 'none', color: 'black' }}>
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
