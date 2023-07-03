import { useState, useEffect, useContext } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';



const Company = ({ company }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [companyData, setcompanyData] = useState({});
  const [currentUser, setCurrentUser] = useState(null); 

  useEffect(() => {
    const fetchCompany = async () => {
        try {
          const token = localStorage.getItem('session_token'); // Get the session token from local storage
          console.log('Token', token);
          const response = await axios.get('http://localhost:5000/api/company', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setcompanyData(response.data);
        } catch (error) {
          console.error('Error fetching company details:', error);
        }
    };

    fetchCompany();
  }, []);

  
  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/company', values);
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating company details:', error);
      setShowErrorNotification(true);
    }
  };


  return (
    <Box m="20px">
      <Header
        title="COMPANY"
        subtitle="Please update your company data whenever necessary. These are the basics for your optimized Scheduler."
      />
      <h2>Company Information</h2>

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{
          company_name: companyData.company_name, // Use companyData values as defaults
          weekly_hours: companyData.weekly_hours,
          shifts: companyData.shifts,
          ...Array.from({ length: companyData.day_num }).reduce((acc, _, rowIndex) => {
            acc[`day_${rowIndex}_0`] = companyData.temp_dict[`${rowIndex + 1}&0`];
            acc[`day_${rowIndex}_1`] = companyData.temp_dict[`${rowIndex + 1}&1`];
            return acc;
          }, {}),
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
                Firmennamen
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={companyData.company_name}
                name="company_name"
                error={!!touched.company_name && !!errors.company_name}
                helperText={touched.company_name && errors.company_name}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 4",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
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
                Weekly Hours
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.weekly_hours}
                name="weekly_hours"
                placeholder={companyData.weekly_hours || ""}
                error={!!touched.weekly_hours && !!errors.weekly_hours}
                helperText={touched.weekly_hours && errors.weekly_hours}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 4",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
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
                Shifts
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.shifts}
                name="shifts"
                error={!!touched.shifts && !!errors.shifts}
                helperText={touched.shifts && errors.shifts}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 4",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
            </Box>
            <></>
            <></>
            <h2>Opening Hour of your mother's legs</h2>
            <></>
            <></>
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
                  alignItems: "center",
                  height: "100%",
                }}
              >
                Weekday
              </Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                Start Time
              </Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                End Time
              </Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 3",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              {Array.from({ length: companyData.day_num }).map((_, rowIndex) => (
              <>
                <Typography
                  key={`number-${rowIndex}`}
                  color={colors.greenAccent[500]}
                  variant=""
                  sx={{
                    gridColumn: "span 1",
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  {companyData && companyData.weekdays
                    ? companyData.weekdays[rowIndex]
                    : ""}
                  </Typography>
                  <TextField
                    key={`day_${rowIndex}_0`}
                    fullWidth
                    variant="filled"
                    type="time"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values[`day_${rowIndex}_0`]}
                    name={`day_${rowIndex}_0`}
                    error={
                      !!touched[`day_${rowIndex}_0`] &&
                      !!errors[`day_${rowIndex}_0`]
                    }
                    helperText={
                      touched[`day_${rowIndex}_0`] &&
                      errors[`day_${rowIndex}_0`]
                    }
                    sx={{ gridColumn: "span 1" }}
                  />
                  <TextField
                    key={`day_${rowIndex}_1`}
                    fullWidth
                    variant="filled"
                    type="time"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values[`day_${rowIndex}_1`]}
                    name={`day_${rowIndex}_1`}
                    error={
                      !!touched[`day_${rowIndex}_1`] &&
                      !!errors[`day_${rowIndex}_1`]
                    }
                    helperText={
                      touched[`day_${rowIndex}_1`] &&
                      errors[`day_${rowIndex}_1`]
                    }
                    sx={{ gridColumn: "span 1" }}
                  />

                  <Typography
                    key={`empty-1-${rowIndex}`}
                    color={colors.greenAccent[500]}
                    variant=""
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                </>
              ))}
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
        message="Error occurred - Your shifts might already be in use"
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
  company_name: yup.string(),
  weekly_hours: yup.number(),
  shifts: yup.number(),
});

export default Company;