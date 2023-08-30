import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography, ButtonGroup, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { ThreeDots } from "react-loader-spinner"; 
import axios from 'axios';

const BUTTON_STYLE = {
  borderColor: "white",
  "&.MuiButton-outlined": {
    borderColor: "white",
  },
  "&:hover": {
    borderColor: "white",
  },
  "&.MuiButtonText": {
    borderColor: "white",
    color: "white",
    backgroundColor: "#2e7c67",
  },
};

const TimeReq = ({ timereq }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [timereqData, setTimeReqData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [openingHours, setOpeningHours] = useState([]);
  const [closingHours, setClosingHours] = useState([]);
  const [startBreak, setStartBreak] = useState([]);
  const [endBreak, setEndBreak] = useState([]);
  const [weekAdjustment, setWeekAdjustment] = useState(0);
  const token = localStorage.getItem('session_token'); 
  const [employeeCount, setEmployeeCount] = useState({});
  const [selectedButtons, setSelectedButtons] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [slotEmployeeCounts, setSlotEmployeeCounts] = useState({});

  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hour, minute] = timeStr.split(":");
    return parseInt(hour) * 60 + parseInt(minute);
  };
  
  // Helper function to check if the current time is within the operating hours and break time
  const isTimeWithinRange = (current, opening, startBreak, endBreak, closing) => {
    if (closing === 0 || closing === '') {
      return current >= opening && current <= closing;
    }
      return (current >= opening && current < startBreak) || (current >= endBreak && current <= closing);
  };

  useEffect(() => {
    const endDrag = () => setIsDragging(false);
    window.addEventListener('mouseup', endDrag);
    
    return () => {
        window.removeEventListener('mouseup', endDrag);
    }
  }, []);  

  const handleMouseDown = useCallback((colIndex, btnIndex) => {
    setIsDragging(true);
    toggleButtonSelection(colIndex, btnIndex);
  }, []);

  const toggleButtonSelection = (columnIndex, btnIndex) => {
    const selectedKey = `${columnIndex}-${btnIndex}`;
    setSelectedButtons(prevSelectedButtons => {
      if (prevSelectedButtons.includes(selectedKey)) {
        return prevSelectedButtons.filter(key => key !== selectedKey);
      } else {
        return [...prevSelectedButtons, selectedKey];
      }
    });
  };

  const setEmployees = (e, columnIndex) => {
    const value = parseInt(e.target.value);
    setEmployeeCount({
      ...employeeCount,
      [columnIndex]: value,
    });
  };

  const EnteredSlots = (columnIndex) => {
    const updatedCounts = { ...slotEmployeeCounts };
    selectedButtons.forEach(slot => {
      const [colIdx, btnIdx] = slot.split('-');
      if (parseInt(colIdx) === columnIndex) {  // Only update for the correct column
        updatedCounts[slot] = employeeCount[columnIndex];
      }
    });
    setSlotEmployeeCounts(updatedCounts);
    setSelectedButtons([]);
    setEmployeeCount({ ...employeeCount, [columnIndex]: 0 }); // Reset only the current column's count to 0
  };
  
  
  useEffect(() => {
    const fetchTimeReqData = async () => {
      setIsLoading(true);
        try {
          const response = await axios.get('http://localhost:5000/api/requirement/workforce?week_adjustment=' + weekAdjustment, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          
          const data = response.data;
          setTimeReqData(data);
          setSlotEmployeeCounts(data.timereq_dict)
          console.log(data.timereq)

          const openingHours = [];
          const startBreak = [];
          const endBreak = []
          const closingHours = [];
          
          for (let i = 0; i < data.day_num; i++) {
            openingHours.push(data.opening_dict[`${i+1}&0`]);
            startBreak.push(data.opening_dict[`${i+1}&1`]);
            endBreak.push(data.opening_dict[`${i+1}&2`]);
            closingHours.push(data.opening_dict[`${i+1}&3`]);
          }

          setOpeningHours(openingHours);
          setStartBreak(startBreak);
          setEndBreak(endBreak);
          setClosingHours(closingHours);
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
      const payload = {};
    
      Object.entries(slotEmployeeCounts).forEach(([key, count]) => {
        const [columnIndex, btnIndex] = key.split('-');
        const dayNum = columnIndex; // Assuming columnIndex starts from 0
        const currentTime = timereqData.slots_dict[parseInt(btnIndex)];
        const newKey = `worker_${dayNum}_${currentTime}`;
        payload[newKey] = count.toString();
      });

      console.log("Posting the following payload to the server:", payload);

      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/requirement/workforce?week_adjustment=' + weekAdjustment, payload, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        }
    });
      setShowSuccessNotification(true);
      console.log(payload);
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
              <IconButton 
                onClick={goToPreviousWeek} 
                style={BUTTON_STYLE}>
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
              <IconButton 
                onClick={goToNextWeek} 
                style={BUTTON_STYLE}>
                <ChevronRight />
              </IconButton>
            </Box>
              <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)', // 7 columns for each day
                  gap: theme.spacing(2),
                  marginBottom: '1rem'
              }}>

              {Array.from({ length: timereqData.day_num }).map((_, columnIndex) => (
                <Box key={`column-${columnIndex}`} sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: 100, // Set a fixed width
                }}>
                  <Typography variant="h4" gutterBottom component="div">
                    {timereqData.weekdays[columnIndex]}
                  </Typography>
                  <TextField 
                    type="number" 
                    value={employeeCount[columnIndex] || ''} 
                    onChange={(e) => setEmployees(e, columnIndex)} 
                    label="Enter employee count" 
                    variant="outlined"
                    fullWidth
                    inputProps={{ min: 0 }}
                  />
                  <Button 
                    variant="contained"
                    color="primary"
                    onClick={() => EnteredSlots(columnIndex)}
                  >
                    Enter
                  </Button>
                  <Box 
                      sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          width: '100%', // Full width
                          height: 500, // Set a fixed height
                          overflowY: 'auto', // To allow scrolling if the content exceeds the fixed height
                          border: '1px solid', // To visualize the box
                        }}>
                  
                  {Array.from({ length: timereqData.daily_slots }).map((_, btnIndex) => {
                    const currentTimeMinutes = convertTimeToMinutes(timereqData.slots_dict[btnIndex]);
    
                    const openingTimeMinutes = convertTimeToMinutes(openingHours[columnIndex]);
                    const startBreakTimeMinutes = convertTimeToMinutes(startBreak[columnIndex]) - 1;
                    const endBreakTimeMinutes = convertTimeToMinutes(endBreak[columnIndex]);
                    const closingTimeMinutes = convertTimeToMinutes(closingHours[columnIndex]) - 1;

                    // Check if the current time is within the opening and closing hours
                    if (isTimeWithinRange(currentTimeMinutes, openingTimeMinutes, startBreakTimeMinutes, endBreakTimeMinutes, closingTimeMinutes)) {
                      const isSelected = selectedButtons.includes(`${columnIndex}-${btnIndex}`);
                      const employeeCountForThisSlot = slotEmployeeCounts[`${columnIndex}-${btnIndex}`] || '';
                      const isEntered = slotEmployeeCounts[`${columnIndex}-${btnIndex}`] !== undefined;
                      return (
                        <Button
                          key={`btn-${btnIndex}`}
                          variant={(isEntered) ? 'text' : (isSelected ? 'contained' : 'outlined')}
                          color={(isEntered) ? 'error' : (isSelected ? 'success' : 'inherit')}
                          onMouseDown={() => handleMouseDown(columnIndex, btnIndex)}
                          onMouseOver={() => {
                            if (isDragging) {
                              toggleButtonSelection(columnIndex, btnIndex);
                          }
                        }}
                          onMouseUp={() => {
                              setIsDragging(false);
                          }}
                          sx={{
                            borderColor: "white",
                            "&.MuiButton-outlined": {
                              borderColor: "white",
                            },
                            "&:hover": {
                              borderColor: "white",
                            },
                            "&.MuiButtonText": {
                              borderColor: "white",
                              color: "white",
                              backgroundColor: "#2e7c67",
                            },
                          }}
                        >
                        {`${timereqData.slots_dict && timereqData.slots_dict[btnIndex]}`}
                        <span>&nbsp;&nbsp;&nbsp;{employeeCountForThisSlot}</span>
                        </Button>
                      );
                    }
                    return null; // Return null if the current time is outside the opening and closing hours
                  })}

                  </Box>
                </Box>
              
            ))}       
            <Button 
              variant="outlined"
              color="inherit"
              onClick={handleFormSubmit}
              sx={{
                borderColor: 'white',
                '&.MuiButton-outlined': {
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
              }}
            >
              Submit
            </Button>
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
