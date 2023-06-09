import { useState, useEffect } from "react";
import { useTheme, Box, Button, TextField, InputAdornment, MenuItem, Select, FormControl, Snackbar  } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';


const Update = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [userData, setUserData] = useState({});


  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/update');
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching company details:', error);
      }
    };

    fetchCompany();
  }, []);

  const handleFormSubmit = (values, { resetForm }) => {
    axios
      .post('http://localhost:5000/api/update', values)
      .then((response) => {
        console.log(response.data);
        setShowSuccessNotification(true);
        resetForm();
      })
      .catch((error) => {
        console.error(error);
        setShowErrorNotification(true);
      });
  };

  return (
    <Box m="20px">
      <Header title="PERSONAL UPDATE" subtitle="Aktualisiere deine persönlichen Daten" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={{
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          employment_level: userData.employment_level,
          department: userData.department,
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
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
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
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Pensum"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.employment_level}
                name="employment_level"
                error={!!touched.employment_level && !!errors.employment_level}
                helpertext={touched.employment_level && errors.employment_level}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label="Department"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.department}
                name="department"
                error={!!touched.department && !!errors.department}
                helpertext={touched.department && errors.department}
                sx={{ gridColumn: "span 4" }}
              />
             
            </Box>
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
        message="Registration successful"
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
        message="Error occurred - Your email might already be in use"
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
  first_name: yup.string().required("required"),
  last_name: yup.string().required("required"),
  email: yup.string().email("invalid email").required("required"),
  employment_level: yup
    .number()
    .min(0, 'Company level must be greater than or equal to 0%')
    .max(100, 'Company level must be less than or equal to 100%')
    .required("required"),
});

export default Update;
