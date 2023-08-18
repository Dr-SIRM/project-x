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

const TimeReq = ({ timereq }) => {
    const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [timereqData, setTimeReqData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [weekAdjustment, setWeekAdjustment] = useState(0);
  const token = localStorage.getItem('session_token'); 

    useEffect(() => {
    const fetchTimeReqData = async () => {
      setIsLoading(true);
        try {
          const response = await axios.get('http://localhost:5000/api/requirement/workforce?week_adjustment=' + weekAdjustment, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setTimeReqData(response.data);
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching Time Requirements:', error);
          setIsLoading(false);
        }
    };

    fetchTimeReqData();
  }, [weekAdjustment]);

  const goToNextWeek = () => {
    setWeekAdjustment(weekAdjustment + 7);
  };

  const goToPreviousWeek = () => {
    setWeekAdjustment(weekAdjustment - 7);
  };


  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/requirement/workforce?week_adjustment=' + weekAdjustment, values, {
    headers: {
        'Authorization': `Bearer ${token}`
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
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
        title="Time Requirement"
        subtitle="Plan your workforce on weekly base and ensure minimal costs!"
      />
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
              <IconButton onClick={goToPreviousWeek} 
              sx={{
                borderColor: 'white',
                '&.MuiButton-outlined': {
                  borderColor: 'white',
                },
                '&:hover': {
                  borderColor: 'white',
                },
                '&.MuiButton-text': {
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
                  }).format(new Date(timereqData.week_start))
                }
              </Typography>
              <IconButton onClick={goToNextWeek} 
              sx={{
                borderColor: 'white',
                '&.MuiButton-outlined': {
                  borderColor: 'white',
                },
                '&:hover': {
                  borderColor: 'white',
                },
                '&.MuiButton-text': {
                  borderColor: 'white',
                  color: 'white',
                  backgroundColor: '#2e7c67',
                }
              }}>
                <ChevronRight />
              </IconButton>
            </Box>
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)', // 7 columns for each box
                gap: theme.spacing(2),
                marginBottom: '1rem'
                }}>

                {Array.from({ length: 7 }).map((_, columnIndex) => (
                    <Box 
                        key={`column-${columnIndex}`} 
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: 150, // Set a fixed width
                            height: 500, // Set a fixed height
                            overflowY: 'auto', // To allow scrolling if the content exceeds the fixed height
                            border: '1px solid', // Optional, but can help visualize the box
                          }}>
                    <Typography color={colors.greenAccent[500]}>
                        {columnIndex}
                    </Typography>
                    {Array.from({ length: 96 }).map((_, btnIndex) => (
                        <Button
                        key={`btn-${btnIndex}`}
                        variant="outlined"
                        color="inherit"
                        sx={{
                            borderColor: 'white',
                            '&.MuiButton-outlined': {
                            borderColor: 'white',
                            },
                            '&:hover': {
                            borderColor: 'white',
                            },
                            '&.MuiButton-text': {
                            borderColor: 'white',
                            color: 'white',
                            backgroundColor: '#2e7c67',
                            marginTop: theme.spacing(2) // spacing between buttons
                            }
                        }}
                        >
                        {btnIndex}
                        </Button>
                    ))}
                    </Box>
                ))}

                </Box>
         
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


export default TimeReq;
