import { useState, useEffect } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { ThreeDots } from "react-loader-spinner"; 
import axios from 'axios';
import Alert from '@mui/material/Alert';
import { Padding } from "@mui/icons-material";
import { API_BASE_URL } from "../../config";



const Company = ({ company }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [companyData, setcompanyData] = useState({});
  const [isLoading, setIsLoading] = useState(true); 
  const token = localStorage.getItem('session_token');
  const [additionalTimes, setAdditionalTimes] = useState(0);

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/company`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setcompanyData(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching company details:', error);
          setIsLoading(false);
        }
    };

    fetchCompany();
  }, []);

  
  const handleFormSubmit = async (values) => {
    
    // Object.keys(values).forEach((key) => {
    //   if (values[key] === '' || values[key] === undefined) {
    //     values[key] = '00:00';
    //   }
    // });

    try {
      // Send the updated form values to the server for database update
      await axios.post(`${API_BASE_URL}/api/company`, values, {
    headers: {
        'Authorization': `Bearer ${token}`
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating company details:', error);
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

  const handleAddTime = () => {
    if (additionalTimes < 2) {
      setAdditionalTimes(additionalTimes + 1);
    }
  };

  return (
    <Box m="20px">
      <Header
        title="COMPANY"
        subtitle="Please update your company data whenever necessary. These are the basics for your optimized Scheduler."
      />
      <Typography variant="h4" paddingBottom={"10px"}>Firmen Information</Typography>
      

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{
          company_name: companyData.company_name, // Use companyData values as defaults
          weekly_hours: companyData.weekly_hours,
          shifts: companyData.shifts,
          department: companyData.department,
          department2: companyData.department2,
          department3: companyData.department3,
          department4: companyData.department4,
          department5: companyData.department5,
          department6: companyData.department6,
          department7: companyData.department7,
          department8: companyData.department8,
          department9: companyData.department9,
          department10: companyData.department10,
          ...Array.from({ length: companyData.day_num }).reduce((acc, _, rowIndex) => {
            acc[`day_${rowIndex}_0`] = companyData.opening_dict[`${rowIndex + 1}&0`];
            acc[`day_${rowIndex}_1`] = companyData.opening_dict[`${rowIndex + 1}&1`];
            acc[`day_${rowIndex}_2`] = companyData.opening_dict[`${rowIndex + 1}&2`];
            acc[`day_${rowIndex}_3`] = companyData.opening_dict[`${rowIndex + 1}&3`];
            return acc;
          }, {}),
        }}
        validationSchema={checkoutSchema}
        // validate={values => {
        //   const errors = {};
        //   for (let i = 0; i < companyData.day_num; i++) {
        //     const end_time1 = values[`day_${i}_1`];
        //     const start_time2 = values[`day_${i}_2`];
        //     if (start_time2 <= end_time1) {
        //       errors[`day_${i}_2`] = 'Start Zeit 2 muss grösser als Endzeit 1 sein';
        //     }
        //   }
        //   return errors;
        // }}
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
                  alignItems: "center",
                  justifyContent: "center", // Center the text horizontally
                  height: "100%",
                  padding: "0 8px", // Add padding to the sides of the text
                  backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
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
                value={values.company_name}
                name="company_name"
                error={!!touched.company_name && !!errors.company_name}
                helperText={touched.company_name && errors.company_name}
                sx={{
                  gridColumn: "span 1",
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
                  justifyContent: "center", // Center the text horizontally
                  height: "100%",
                  padding: "0 8px", // Add padding to the sides of the text
                  backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
                }}
              >
                Abteilung 1
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
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              <Typography
                variant=""
                sx={{
                  gridColumn: "span 2",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", // Center the text horizontally
                  height: "100%",
                  padding: "0 8px", // Add padding to the sides of the text
                  backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
                }}
              >
                Wochenstunden
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
                sx={{
                  gridColumn: "span 1",
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
                  justifyContent: "center", // Center the text horizontally
                  height: "100%",
                  padding: "0 8px", // Add padding to the sides of the text
                  backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
                }}
              >
                Abteilung 2
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.department2}
                name="department2"
                error={!!touched.department2 && !!errors.department2}
                helperText={touched.department2 && errors.department2}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              <Typography
                variant=""
                sx={{
                  gridColumn: "span 2",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", // Center the text horizontally
                  height: "100%",
                  padding: "0 8px",
                  backgroundColor: "#f0f0f0", 
                }}
              >
                Schichten
              </Typography>
              <Select
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
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                  '& .MuiSelect-icon': { 
                    color: 'black', 
                  },
                }}
                >
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                </Select>
                <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center", // Center the text horizontally
                  height: "100%",
                  padding: "0 8px", // Add padding to the sides of the text
                  backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
                }}
              >
                Abteilung 3
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.department3}
                name="department3"
                error={!!touched.department3 && !!errors.department3}
                helperText={touched.department3 && errors.department3}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              <Typography
                variant=""
                sx={{
                  gridColumn: "span 2",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
            </Box>
            <></>
            <></>
            <Typography variant="h4" paddingBottom={"20px"} paddingTop={"30px"}>Öffnungszeiten</Typography>
            
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
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "center",
                }}
              >
                Wochentag
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                Startzeit 1
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                Endezeit 1
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                Startzeit 2
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                Endezeit 2
              </Typography>

              <Typography
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              {Array.from({ length: companyData.day_num }).map((_, rowIndex) => (
              <>
                <Typography
                  key={`number-${rowIndex}`}
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // Center the text horizontally
                    height: "100%",
                    padding: "0 8px", // Add padding to the sides of the text
                    backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
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
                    value={values[`day_${rowIndex}_0`] === '00:00' ? '' : values[`day_${rowIndex}_0`]}
                    name={`day_${rowIndex}_0`}
                    error={
                      !!touched[`day_${rowIndex}_0`] &&
                      !!errors[`day_${rowIndex}_0`]
                    }
                    helperText={
                      touched[`day_${rowIndex}_0`] &&
                      errors[`day_${rowIndex}_0`]
                    }
                    sx={{
                      gridColumn: "span 1",
                      '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      },
                    }}
                  />
                  <TextField
                    key={`day_${rowIndex}_1`}
                    fullWidth
                    variant="filled"
                    type="time"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values[`day_${rowIndex}_1`] === '00:00' ? '' : values[`day_${rowIndex}_1`]}
                    name={`day_${rowIndex}_1`}
                    error={
                      !!touched[`day_${rowIndex}_1`] &&
                      !!errors[`day_${rowIndex}_1`]
                    }
                    helperText={
                      touched[`day_${rowIndex}_1`] &&
                      errors[`day_${rowIndex}_1`]
                    }
                    sx={{
                      gridColumn: "span 1",
                      '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      },
                    }}
                  />
                  <TextField
                    key={`day_${rowIndex}_2`}
                    fullWidth
                    variant="filled"
                    type="time"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values[`day_${rowIndex}_2`] === '00:00' ? '' : values[`day_${rowIndex}_2`]}
                    name={`day_${rowIndex}_2`}
                    error={
                      !!touched[`day_${rowIndex}_2`] &&
                      !!errors[`day_${rowIndex}_2`]
                    }
                    helperText={
                      touched[`day_${rowIndex}_2`] &&
                      errors[`day_${rowIndex}_2`]
                    }
                    sx={{
                      gridColumn: "span 1",
                      '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      },
                    }}
                  />
                  <TextField
                    key={`day_${rowIndex}_3`}
                    fullWidth
                    variant="filled"
                    type="time"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values[`day_${rowIndex}_3`] === '00:00' ? '' : values[`day_${rowIndex}_3`]}
                    name={`day_${rowIndex}_3`}
                    error={
                      !!touched[`day_${rowIndex}_3`] &&
                      !!errors[`day_${rowIndex}_3`]
                    }
                    helperText={
                      touched[`day_${rowIndex}_3`] &&
                      errors[`day_${rowIndex}_3`]
                    }
                    sx={{
                      gridColumn: "span 1",
                      '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      },
                    }}
                  />
                  <Typography
                    key={`empty-1-${rowIndex}`}
                    color={colors.greenAccent[500]}
                    variant=""
                    sx={{
                      gridColumn: "span 1",
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  
                </>
              ))}
            </Box>
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
          autoHideDuration={3000}
          ContentProps={{
              sx: {
                  backgroundColor: "green !important",
                  color: "white",
              }
          }}
      >
          <Alert onClose={() => setShowSuccessNotification(false)} severity="success" sx={{ width: '100%' }}>
              Verfügbarkeit erfolgreich erfasst
          </Alert>
      </Snackbar>
      <Snackbar
        open={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        autoHideDuration={3000}
        ContentProps={{
            sx: {
                backgroundColor: "red !important",
                color: "white",
            }
        }}
    >
        <Alert onClose={() => setShowErrorNotification(false)} severity="error" sx={{ width: '100%' }}>
            Update nicht erfolgreich
        </Alert>
    </Snackbar>
    </Box>
  );
};

const checkoutSchema = yup.object().shape({
  company_name: yup.string(),
  weekly_hours: yup.number(),
  shifts: yup.number(),
});

export default Company;