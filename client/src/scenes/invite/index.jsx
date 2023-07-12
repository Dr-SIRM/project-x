import { useState, useEffect, useContext } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';



const Invite = ({ invite }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [inviteData, setinviteData] = useState({});
  const token = localStorage.getItem('session_token'); // Get the session token from local storage

  useEffect(() => {
    const fetchInvite = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/invite', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setinviteData(response.data);
        } catch (error) {
          console.error('Error fetching invite details:', error);
        }
    };

    fetchInvite();
  }, []);

  
  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/invite', values, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating invite details:', error);
      setShowErrorNotification(true);
    }
  };


  return (
    <Box m="20px">
      <Header
        title="INVITE"
        subtitle="Add your new team member into your business."
      />
      <h2>Invite your Teammember</h2>

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{
          email: inviteData.email,
          company_name: inviteData.company_name,
          department: inviteData.department,
          employment: inviteData.employment,
          employment_level: inviteData.employment_level,
          access_level: inviteData.access_level,
        }}
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
                sx={{ gridColumn: "span 1" }}
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
                sx={{ gridColumn: "span 1" }}
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
                sx={{ gridColumn: "span 1" }}
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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.employment}
                name="employment"
                error={!!touched.employment && !!errors.employment}
                helperText={touched.employment && errors.employment}
                sx={{ gridColumn: "span 1" }}
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
                Employment Level
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.employment_level}
                name="employment_level"
                error={!!touched.employment_level && !!errors.employment_level}
                helperText={touched.employment_level && errors.employment_level}
                sx={{ gridColumn: "span 1" }}
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
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.access_level}
                name="access_level"
                error={!!touched.access_level && !!errors.access_level}
                helperText={touched.access_level && errors.access_level}
                sx={{ gridColumn: "span 1" }}
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
        message="Invititation E-Mail is send!"
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
        message="Error occurred - E-Mail is already in use!"
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


export default Invite;
