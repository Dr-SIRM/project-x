import { useState, useEffect, useContext } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, Box, Button, TextField, Snackbar, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import Header from "../../components/Header";
import { Select, MenuItem } from "@mui/material";
import { tokens } from "../../theme";
import axios from 'axios';



const Registration = ({ registration }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [registrationData, setregistrationData] = useState({});
  const token = localStorage.getItem('session_token'); // Get the session token from local storage

  const [password, setPassword] = useState('');
  const [open, setOpen] = useState(true); // Starts open to show the dialog immediately
  const correctPassword = "Ass&Titties"; // replace this with your password


  useEffect(() => {
    const fetchRegistration = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/registration/admin', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setregistrationData(response.data);
        } catch (error) {
          console.error('Error fetching Registration data:', error);
        }
    };

    fetchRegistration();
  }, []);

  const handleClose = () => {
    if (password === correctPassword) {
      console.log("Password is correct");
      setOpen(false);
    } else {
      console.log("Incorrect password");
      alert("Incorrect password"); // This is a basic alert, you might want to replace this with a more user-friendly message
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  
  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/registration/admin', values, {
    headers: {
        'Authorization': `Bearer ${token}`,
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
          <Button onClick={handleClose}>
            Enter
          </Button>
        </DialogActions>
      </Dialog>
      <Header
        title="Registration"
        subtitle=""
      />
      <h2>Register Now</h2>

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
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                First Name
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
                sx={{ gridColumn: "span 2" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Last Name
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
                sx={{ gridColumn: "span 2" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Employment
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.employment || ''}
                name="employment"
                error={!!touched.employment && !!errors.employment}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value={'Perm'}>Festangestellt</MenuItem>
                <MenuItem value={'Temp'}>Teilzeit</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Employment Level
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.employment_level || ''}
                name="employment_level"
                error={!!touched.employment_level && !!errors.employment_level}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value={'1'}>100%</MenuItem>
                <MenuItem value={'0.9'}>90%</MenuItem>
                <MenuItem value={'0.8'}>80%</MenuItem>
                <MenuItem value={'0.7'}>70%</MenuItem>
                <MenuItem value={'0.6'}>60%</MenuItem>
                <MenuItem value={'0.5'}>50%</MenuItem>
                <MenuItem value={'0.4'}>40%</MenuItem>
                <MenuItem value={'0.3'}>30%</MenuItem>
                <MenuItem value={'0.2'}>20%</MenuItem>
                <MenuItem value={'0.1'}>10%</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Company
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.company_name}
                name="company_name"
                error={!!touched.company_name && !!errors.company_name}
                helperText={touched.company_name && errors.company_name}
                sx={{ gridColumn: "span 2" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Department
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.department}
                name="department"
                error={!!touched.department && !!errors.department}
                helperText={touched.department && errors.department}
                sx={{ gridColumn: "span 2" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Access Level
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.access_level || ''}
                name="access_level"
                error={!!touched.access_level && !!errors.access_level}
                sx={{ gridColumn: "span 2" }}
              >
                <MenuItem value={'User'}>User</MenuItem>
                <MenuItem value={'Admin'}>Admin</MenuItem>
                <MenuItem value={'Super_Admin'}>Super Admin</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                E-Mail
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
                sx={{ gridColumn: "span 2" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Password
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
                sx={{ gridColumn: "span 2" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Repeat Password
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
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <></>
            
            <Box display="flex" justifyContent="end" mt="20px">
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
  department: yup.string().required("required"),
  employment: yup.string().required("required"),
  employment_level: yup
    .number()
    .min(0, 'Company level must be greater than or equal to 0%')
    .max(100, 'Company level must be less than or equal to 100%')
    .required("required"),
  access_level: yup.string().required("required"),
});


export default Registration;
