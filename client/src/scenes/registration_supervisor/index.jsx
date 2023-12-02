import { useState, useEffect, useContext } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  useTheme,
  Box,
  Button,
  TextField,
  Snackbar,
  InputLabel,
  FormControl,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Header from "../../components/Header";
import { Select, MenuItem } from "@mui/material";
import { tokens } from "../../theme";
import axios from "axios";
import { API_BASE_URL } from "../../config";

const Registration = ({ registration }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [registrationData, setregistrationData] = useState({});
  const token = localStorage.getItem("session_token"); // Get the session token from local storage

  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(true); // Starts open to show the dialog immediately
  const correctPassword = "Ass&Titties"; // replace this with your password

  const handleClose = () => {
    if (password === correctPassword) {
      // console.log("Password is correct");
      setOpen(false);
    } else {
      // console.log("Incorrect password");
      alert("Incorrect password"); // This is a basic alert, you might want to replace this with a more user-friendly message
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post(`${API_BASE_URL}/api/registration/admin`, values, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      setShowSuccessNotification(true);
    } catch (error) {
      // console.error("Error updating registration details:", error);
      setShowErrorNotification(true);
    }
  };

  return (
    <Box m="20px">
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Password Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To access this page, please enter the password.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={handlePasswordChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Enter</Button>
        </DialogActions>
      </Dialog>
      <Header title="Register Now" subtitle="Erstelle einen neuen User" />

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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Vorname"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.first_name}
                name="first_name"
                error={!!touched.first_name && !!errors.first_name}
                helpertext={touched.first_name && errors.first_name}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Nachname"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.last_name}
                name="last_name"
                error={!!touched.last_name && !!errors.last_name}
                helpertext={touched.last_name && errors.last_name}
                sx={{ gridColumn: "span 2" }}
              />
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 2",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helpertext={touched.email && errors.email}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                label="Telefonnummer"
                onBlur={handleBlur}
                onChange={handleChange}
                defaultCountry={"us"}
                value={values.phone_number}
                name="phone_number"
                error={!!touched.phone_number && !!errors.phone_number}
                helperText={touched.phone_number && errors.phone_number}
                sx={{ gridColumn: "span 2" }}
              />
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 2",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Firmennamen"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.company_name}
                name="company_name"
                error={!!touched.company_name && !!errors.company_name}
                helpertext={touched.company_name && errors.company_name}
                sx={{ gridColumn: "span 2" }}
              />
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel id="employment-label">Anstellung</InputLabel>
                <Select
                  labelId="employment-label"
                  id="employment"
                  name="employment"
                  value={values.employment}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.employment && !!errors.employment}
                  helpertext={touched.employment && errors.employment}
                  sx={{
                    gridColumn: "span 2",
                    "& .MuiFilledInput-input": {
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    },
                    "& .MuiSelect-icon": {
                      color: "black",
                    },
                  }}
                >
                  <MenuItem value="Perm">Vollzeit</MenuItem>
                  <MenuItem value="Temp">Teilzeit</MenuItem>
                </Select>
              </FormControl>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 2",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel id="employment-level-label">Pensum</InputLabel>
                <Select
                  labelId="employment-level-label"
                  id="employment-level-select"
                  onBlur={handleBlur}
                  onChange={(event) => {
                    const selectedValue = event.target.value;
                    const decimalValue = selectedValue / 100;
                    handleChange({
                      target: {
                        name: "employment_level",
                        value: decimalValue,
                      },
                    });
                  }}
                  value={
                    values.employment_level ? values.employment_level * 100 : ""
                  }
                  name="employment_level"
                  error={
                    !!touched.employment_level && !!errors.employment_level
                  }
                  renderValue={(selected) => `${selected}%`}
                  sx={{
                    gridColumn: "span 2",
                    "& .MuiFilledInput-input": {
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    },
                    "& .MuiSelect-icon": {
                      color: "black",
                    },
                  }}
                >
                  {Array.from(Array(10).keys()).map((percentage) => {
                    const value = (percentage + 1) * 10;
                    return (
                      <MenuItem key={percentage + 1} value={value}>
                        {value}%
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              <FormControl
                fullWidth
                variant="filled"
                sx={{ gridColumn: "span 2" }}
              >
                <InputLabel id="access_level-label">Access Level</InputLabel>
                <Select
                  labelId="access_level-label"
                  id="access_level"
                  name="access_level"
                  value={values.access_level}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.access_level && !!errors.access_level}
                  helpertext={touched.access_level && errors.access_level}
                  sx={{
                    gridColumn: "span 2",
                    "& .MuiFilledInput-input": {
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    },
                    "& .MuiSelect-icon": {
                      color: "black",
                    },
                  }}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="User">User</MenuItem>
                  <MenuItem value="Super_Admin">Super Admin</MenuItem>
                </Select>
              </FormControl>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 2",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password}
                name="password"
                error={!!touched.password && !!errors.password}
                helperText={touched.password && errors.password}
                sx={{ gridColumn: "span 2" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="password"
                label="Confirm Password"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.password2}
                name="password2"
                error={!!touched.password2 && !!errors.password2}
                helperText={touched.password2 && errors.password2}
                sx={{ gridColumn: "span 2" }}
              />
              {values.password !== values.password2 && touched.password2}
            </Box>
            <></>

            <Box display="center" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Update
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Snackbar
        open={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        message="Successful Registered!"
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
        message="Error occurred - Token and E-Mail does not match!"
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
  company_name: yup.string().required("required"),
  employment: yup.string().required("required"),
  employment_level: yup
    .number()
    .min(0, "Company level must be greater than or equal to 0%")
    .max(100, "Company level must be less than or equal to 100%")
    .required("required"),
  access_level: yup.string().required("required"),
});

export default Registration;
