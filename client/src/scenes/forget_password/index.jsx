import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  useTheme,
  Link,
  CircularProgress,
} from "@mui/material";
import Header from "../../components/Header";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";
import "../../i18n";

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { t, i18n } = useTranslation();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/api/forget_password`, {
        email,
      });

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
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Header title={t("forget_password.title")} subtitle="" />
      <Box width="300px" p={2}>
        <form onSubmit={handleSubmit}>
          <Box mb={2}>
            <TextField
              type="email"
              label={t("forget_password.email")}
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Zurücksetzen"
            )}
            {t("forget_password.reset")}
          </Button>
          <Box mb={2}>
            <Button
              variant="contained"
              href="/login"
              fullWidth
              style={{
                textDecoration: "none",
                color: "inherit",
                marginTop: "20px",
              }}
            >
              {t("forget_password.back")}
            </Button>
          </Box>
        </form>
        {message && <p>{message}</p>}
      </Box>
    </Box>
  );
}

export default ForgetPassword;
