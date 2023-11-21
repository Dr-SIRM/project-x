import { useState, useEffect, useContext } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Select, MenuItem } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { ThreeDots } from "react-loader-spinner"; 
import axios from 'axios';
import { API_BASE_URL } from "../../config";



const Invite = ({ invite }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [department_list, setDepartmentList] = useState([]);
  const [inviteData, setinviteData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('session_token'); // Get the session token from local storage

  useEffect(() => {
    const fetchInvite = async () => {
      setIsLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/invite`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setinviteData(response.data);
          setDepartmentList(response.data.department_list);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching invite details:', error);
          setIsLoading(false);
        }
    };

    fetchInvite();
  }, []);

  
  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post(`${API_BASE_URL}/api/invite`, values, {
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
  if (isLoading) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" height="100vh">
        <ThreeDots type="ThreeDots" color="#70D8BD" height={80} width={80} />
      </Box>
    );
  }

  return (
    <Box m="20px">
      <Header
        title="Einladen"
        subtitle="Lade dein Teammitglieder ein"
      />  

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
              paddingTop={"20px"}
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
              }}
            >
              <Typography
                
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  height: "100%",
                  padding: "0 8px", 
                  backgroundColor: "#f0f0f0", 
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
                sx={{
                  gridColumn: "span 2",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              <Typography
                
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  height: "100%",
                  padding: "0 8px", 
                  backgroundColor: "#f0f0f0", 
                }}
              >
                Firma
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
                sx={{
                  gridColumn: "span 2",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
                            <Typography
                
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  height: "100%",
                  padding: "0 8px", 
                  backgroundColor: "#f0f0f0", 
                }}
              >
                Department 1
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.department}
                name="department"
                error={!!touched.deoartment && !!errors.department}
                helperText={touched.department && errors.department}
                sx={{
                  gridColumn: "span 2",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              >
                <MenuItem value="">Wählen Sie eine Abteilung</MenuItem>
                {department_list.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
              <Typography
                
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  height: "100%",
                  padding: "0 8px", 
                  backgroundColor: "#f0f0f0", 
                }}
              >
                Department 2
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.department2}
                name="department2"
                error={!!touched.deoartment2 && !!errors.department2}
                helperText={touched.department2 && errors.department2}
                sx={{
                  gridColumn: "span 2",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              >
                <MenuItem value="">Wählen Sie eine Abteilung</MenuItem>
                {department_list.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
              <Typography
                
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  height: "100%",
                  padding: "0 8px", 
                  backgroundColor: "#f0f0f0", 
                }}
              >
                Department 3
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.department3}
                name="department3"
                error={!!touched.deoartment3 && !!errors.department3}
                helperText={touched.department3 && errors.department3}
                sx={{
                  gridColumn: "span 2",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              >
                <MenuItem value="">Wählen Sie eine Abteilung</MenuItem>
                {department_list.map((department) => (
                  <MenuItem key={department} value={department}>
                    {department}
                  </MenuItem>
                ))}
              </Select>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  height: "100%",
                  padding: "0 8px", 
                  backgroundColor: "#f0f0f0", 
                }}
              >
                Einarbeitung 
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.in_training}
                name="in_training"
                error={!!touched.in_training && !!errors.in_training}
                helperText={touched.in_training && errors.in_training}
                sx={{
                  gridColumn: "span 2",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              >
                <MenuItem value={'X'}>X</MenuItem>
              </Select>
              <Typography
                
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  height: "100%",
                  padding: "0 8px", 
                  backgroundColor: "#f0f0f0", 
                }}
              >
                Anstellung
              </Typography>
              <Select
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
                sx={{
                  gridColumn: "span 2",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              >
                <MenuItem value={'Perm'}>Festangestellt</MenuItem>
                <MenuItem value={'Temp'}>Teilzeit</MenuItem>
              </Select>
              <Typography
                
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  height: "100%",
                  padding: "0 8px", 
                  backgroundColor: "#f0f0f0", 
                }}
              >
                Anstellungsgrad
              </Typography>
              <Select
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
                sx={{
                  gridColumn: "span 2",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                  '& .MuiSelect-icon': { 
                    color: 'black', 
                  },
                }}
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
                
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", 
                  height: "100%",
                  padding: "0 8px", 
                  backgroundColor: "#f0f0f0", 
                }}
              >
                Zugriffslevel
              </Typography>
              <Select
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
                sx={{
                  gridColumn: "span 2",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                  '& .MuiSelect-icon': { 
                    color: 'black', 
                  },
                }}
              >
                <MenuItem value={'User'}>User</MenuItem>
                <MenuItem value={'Admin'}>Admin</MenuItem>
              </Select>
            </Box>
            <></>
            
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="primary" variant="contained">
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
