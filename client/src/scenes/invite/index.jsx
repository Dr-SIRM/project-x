import { useState, useEffect } from "react";
import { useTheme, Box, Button, TextField, InputAdornment, MenuItem, Select, FormControl, InputLabel, Snackbar  } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from 'axios';


const Invite = () => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [inviteData, setinviteData] = useState({});
  const token = localStorage.getItem('session_token'); // Get the session token from local storage

  useEffect(() => {
    const fetchInvite = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/invite', {
              headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
              }
          });
          setinviteData(response.data);
        } catch (error) {
          console.error('Error fetching invite details:', error);
        }
    };

    fetchInvite();
  }, []);

  const handleChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/invite', values, {
    headers: {
        'Authorization': `Bearer ${token}`
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
      <Header title="Invite" subtitle="Lade neue Teammitglieder ein" />

      <Formik
        onSubmit={handleFormSubmit}
        initialValues={{
          company_name: inviteData.company_name, // Use companyData values as defaults
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
                label="Email"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.email}
                name="email"
                error={!!touched.email && !!errors.email}
                helpertext={touched.email && errors.email}
                sx={{ gridColumn: "span 4" }}
              />
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
                <InputLabel id="company-label">Company Name</InputLabel>
                <Select
                  labelId="company-label"
                  id="company_name"
                  name="company_name"
                  value={inviteData.company_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!touched.company_name && !!errors.company_name}
                  helpertext={touched.company_name && errors.company_name}
                >
                  {companies.map((company) => (
                    <MenuItem key={company.company_name} value={company.company_name}>
                      {company.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
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
                >
                  <MenuItem value="Perm">Vollzeit</MenuItem>
                  <MenuItem value="Temp">Teilzeit</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
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
                        name: 'employment_level',
                        value: decimalValue,
                      },
                    });
                  }}
                  value={values.employment_level ? values.employment_level * 100 : ''}
                  name="employment_level"
                  error={!!touched.employment_level && !!errors.employment_level}
                  renderValue={(selected) => `${selected}%`}
                >
                </Select>
              </FormControl>
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
              <FormControl fullWidth variant="filled" sx={{ gridColumn: "span 4" }}>
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
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
             
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Invite
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
  company_name: yup.string().required("required"),
  access_level: yup.string().required("required"),
  employment_level: yup
    .number()
    .min(0, 'Company level must be greater than or equal to 0%')
    .max(100, 'Company level must be less than or equal to 100%')
    .required("required"),
});

const initialValues = {
  first_name: "",
  last_name: "",
  email: "",
  employment_level: "",
  company_name: "",
  access_level: "",
  department: "",
};

export default Invite;
