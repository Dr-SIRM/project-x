import { useState, useEffect } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';

const Availability = ({ availability }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [availabilityData, setavailabilityData] = useState({});

  useEffect(() => {
    const fetchavailabilityData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/availability');
        setavailabilityData(response.data);
      } catch (error) {
        console.error('Error fetching Availability details:', error);
      }
    };

    fetchavailabilityData();
  }, []);

  
  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/availability', values);
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating availability details:', error);
      setShowErrorNotification(true);
    }
  };


  return (
    <Box m="20px">
      <Header
        title="Availability"
        subtitle="Please update your availability data whenever necessary. These are the basics for your optimized Scheduler."
      />
      <h2>Availability Sheet</h2>

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={true}
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
                Start Time 1
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
                End Time 1
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
              Start Time 2
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
                End Time 2
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
              Start Time 3
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
                End Time 3
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
              {Array.from({ length: availabilityData.day_num }).map((_, rowIndex) => (
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
                  {availabilityData && availabilityData.weekdays
                    ? availabilityData.weekdays[rowIndex]
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
});

export default Availability;
