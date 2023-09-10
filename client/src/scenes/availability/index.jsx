import { useState, useEffect } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography, ButtonGroup, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { ThreeDots } from "react-loader-spinner"; 
import axios from 'axios';
import Alert from '@mui/material/Alert';


const Availability = ({ availability }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [availabilityData, setAvailabilityData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [weekAdjustment, setWeekAdjustment] = useState(0);
  const token = localStorage.getItem('session_token'); 
  const [additionalTimes, setAdditionalTimes] = useState(0);

  useEffect(() => {
    const fetchAvailabilityData = async () => {
      setIsLoading(true);
        try {
          const response = await axios.get('http://localhost:5000/api/availability?week_adjustment=' + weekAdjustment, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setAvailabilityData(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching availability details:', error);
          setIsLoading(false);
        }
    };

    fetchAvailabilityData();
}, [weekAdjustment, token]);

useEffect(() => {
  if (availabilityData.temp_dict) {
    const timesForFirstDay = [
      availabilityData.temp_dict['1&2'],
      availabilityData.temp_dict['1&3'],
      availabilityData.temp_dict['1&4'],
      availabilityData.temp_dict['1&5'],
    ];
    const nonZeroTimes = timesForFirstDay.filter(time => time && time !== '00:00');
    setAdditionalTimes(nonZeroTimes.length / 2);
  }
}, [availabilityData]);


  const handleAddTime = () => {
    if (additionalTimes < 2) {
      setAdditionalTimes(additionalTimes + 1);
    }
  };
  
  const goToNextWeek = () => {
    setWeekAdjustment(weekAdjustment + 7);
  };

  const goToPreviousWeek = () => {
    setWeekAdjustment(weekAdjustment - 7);
  };

  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/availability?week_adjustment=' + weekAdjustment, values, {
    headers: {
        'Authorization': `Bearer ${token}`
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating availability details:', error);
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
        title="Verfügbarkeit"
        subtitle="Bitte aktualisieren Sie Ihre Verfügbarkeitsdaten wann immer nötig. Dies sind die Grundlagen für Ihren optimierten Planer."
      />

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{
          ...Array.from({ length: availabilityData.day_num }).reduce((acc, _, rowIndex) => {
            acc[`day_${rowIndex}_0`] = availabilityData.temp_dict[`${rowIndex + 1}&0`] || '00:00';
            acc[`day_${rowIndex}_1`] = availabilityData.temp_dict[`${rowIndex + 1}&1`] || '00:00';
            acc[`day_${rowIndex}_2`] = availabilityData.temp_dict[`${rowIndex + 1}&2`] || '00:00';
            acc[`day_${rowIndex}_3`] = availabilityData.temp_dict[`${rowIndex + 1}&3`] || '00:00';
            acc[`day_${rowIndex}_4`] = availabilityData.temp_dict[`${rowIndex + 1}&4`] || '00:00';
            acc[`day_${rowIndex}_5`] = availabilityData.temp_dict[`${rowIndex + 1}&5`] || '00:00';
            return acc;
          }, {}),
        }}
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
            
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
              <IconButton onClick={goToPreviousWeek} 
              sx={{
                borderColor: 'white',
                '&.MuiButtonOutlined': {
                  borderColor: 'white',
                },
                '&:hover': {
                  borderColor: 'white',
                },
                '&.MuiButtonText': {
                  borderColor: 'white',
                  color: 'white',
                  backgroundColor: '#2e7c67',
                }
              }}>
                <ChevronLeft />
              </IconButton>
              <Typography variant="h5" sx={{margin: '0 1rem'}}>
                {
                  new Intl.DateTimeFormat('de', { 
                    weekday: 'short', 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric'
                  }).format(new Date(availabilityData.week_start))
                }
              </Typography>
              <IconButton onClick={goToNextWeek} 
              sx={{
                borderColor: 'white',
                '&.MuiButtonOutlined': {
                  borderColor: 'white',
                },
                '&:hover': {
                  borderColor: 'white',
                },
                '&.MuiButtonText': {
                  borderColor: 'white',
                  color: 'white',
                  backgroundColor: '#2e7c67',
                }
              }}>
                <ChevronRight />
              </IconButton>
            </Box>
            <Box
      display="grid"
      gap="30px"
      gridTemplateColumns="repeat(7, minmax(0, 1fr))"
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
      {additionalTimes >= 1 && (
        <>
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
        </>
      )}
      {additionalTimes >= 2 && (
        <>
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
        </>
      )}
      {Array.from({ length: availabilityData.day_num }).map((_, rowIndex) => (
        <Box
          display="grid"
          gridTemplateColumns="repeat(7, minmax(0, 1fr))"
          gap="10px"  
          sx={{ gridColumn: "span 7" }}
        >
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
          {Array.from({ length: 2 + additionalTimes * 2 }).map((_, columnIndex) => (
            <TextField
              key={`day_${rowIndex}_${columnIndex}`}
              fullWidth
              variant="filled"
              type="time"
              onBlur={handleBlur}
              onChange={handleChange}
              value={values[`day_${rowIndex}_${columnIndex}`] || 0}
              name={`day_${rowIndex}_${columnIndex}`}
              error={
                !!touched[`day_${rowIndex}_${columnIndex}`] &&
                !!errors[`day_${rowIndex}_${columnIndex}`]
              }
              helperText={
                touched[`day_${rowIndex}_${columnIndex}`] &&
                errors[`day_${rowIndex}_${columnIndex}`]
              }
              sx={{
                gridColumn: "span 1",
                '& .MuiFilledInput-input': {
                  paddingTop: '10px',
                  paddingBottom: '10px',
                },
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
            <Box display="flex" justifyContent="end" mt="20px">
            <Button onClick={handleAddTime} color="primary" variant="contained" sx={{ marginRight: '10px' }}>
              Add Time
            </Button>
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



export default Availability;