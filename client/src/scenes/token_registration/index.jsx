import { useState, useEffect, useContext } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import ReactPhoneInput from 'react-phone-input-material-ui';
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Select, MenuItem } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';
import { API_BASE_URL } from "../../config";
import { useTranslation } from 'react-i18next';
import '../../i18n';  



const Token_Registration = ({ token_registration }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [tokenRegData, settokenRegData] = useState({});
  const token = localStorage.getItem('session_token'); // Get the session token from local storage
  const { t, i18n } = useTranslation();

  

  
  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post(`${API_BASE_URL}/api/token_registration`, values, {
    headers: {
        'Content-Type': 'application/json',
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating registration details:', error);
      setShowErrorNotification(true);
    }
  };


  return (
    <Box m="20px">
      <Header
        title={t('registration.title')}
        subtitle={t('registration.subtitle')}
      />

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{}}
        validationSchema={checkoutSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(6, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              >
                {t('registration.token')}
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.token}
                name="token"
                error={!!touched.token && !!errors.token}
                helperText={touched.token && errors.token}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                {t('registration.email')}
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helperText={touched.email && errors.email}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 2",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                {t('registration.first_name')}
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.first_name}
                name="first_name"
                error={!!touched.first_name && !!errors.first_name}
                helperText={touched.first_name && errors.first_name}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                {t('registration.last_name')}
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.last_name}
                name="last_name"
                error={!!touched.last_name && !!errors.last_name}
                helperText={touched.last_name && errors.last_name}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 2",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                {t('registration.phone_number')}
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                defaultCountry={'us'}
                value={values.phone_number}
                name="phone_number"
                error={!!touched.phone_number && !!errors.phone_number}
                helperText={touched.phone_number && errors.phone_number}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 4",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                {t('registration.password')}
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                {t('registration.password2')}
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password2}
                name="password2"
                error={!!touched.password2 && !!errors.password2}
                helperText={touched.password2 && errors.password2}
                sx={{ gridColumn: "span 1" }}
              />
            </Box>
            <></>
            
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
              {t('button.update')}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Snackbar
        open={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        message={t('registration.success')}
        autoHideDuration={3000}
        sx={{
          backgroundColor: "green !important",
          color: "white",
          "& .MuiSnackbarContent-root": {
            borderRadius: "4px",
            padding: "15px",
            fontSize: "16px",
          },
        }}
      />
      <Snackbar
        open={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        message={t('registration.no_success')}
        autoHideDuration={3000}
        sx={{
          backgroundColor: "red !important",
          color: "white",
          "& .MuiSnackbarContent-root": {
            borderRadius: "4px",
            padding: "15px",
            fontSize: "16px",
          },
        }}
      />
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  email: yup.string().email("invalid email").required("required"),
  first_name: yup.string().required("required"),
  last_name: yup.string().required("required"),
  password: yup.string().required("required"),
  password2: yup
  .string()
  .oneOf([yup.ref("password"), null], "Passwords must match")
  .required("required"),
});


export default Token_Registration;
