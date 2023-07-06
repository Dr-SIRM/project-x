import React, { useState } from "react";
import { Box, Typography, TextField, Button, Alert, useTheme, Link } from '@mui/material';
import axios from "axios";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/forget_password", { email });

      if (response.data) {
        setMessage(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <input type="submit" value="Submit" />
        <Box mb={2}>
          <Typography>
            <Link href="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
              Back
            </Link>
          </Typography>
        </Box>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ForgetPassword;