import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography, ButtonGroup, IconButton } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { useNavigate  } from 'react-router-dom';
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { ThreeDots } from "react-loader-spinner"; 
import axios from 'axios';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { API_BASE_URL } from "../../config";

const BUTTON_STYLE = {
  borderColor: "white",
  "&.MuiButtonOutlined": {
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
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [showMissingNotification, setShowMissingNotification] = useState(false);
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
  const [slotEmployeeCounts, setSlotEmployeeCounts] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const navigate = useNavigate();
  const [department_list, setDepartmentList] = useState([]);

  const convertTimeToMinutes = (timeStr) => {
    if (!timeStr) return undefined;
    const [hour, minute] = timeStr.split(":");
    return parseInt(hour) * 60 + parseInt(minute);
  };

  // Helper function to check if the current time is within the operating hours and break time
  const isTimeWithinRange = (current, opening, startBreak, endBreak, closing) => {
    if (current === undefined || current === null) {
      return false;
    }
    else{
      if (closing < opening || startBreak < opening) {
        if (closing === null || closing === undefined || isNaN(closing)) {
          return (current >= opening ) || (current < startBreak);
        } 
        else {
          return (current >= opening && current < startBreak) || (current >= endBreak && current <= 1440) || (current < closing);
        }
      } 
      else {
        if (closing === null || closing === undefined) {
          return current >= opening && current <= startBreak;
        }
          return (current >= opening && current < startBreak) || (current >= endBreak && current <= closing);
      }
    }
  };


  /// Define Click and Drag Function
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
    // Clone the current state
    const updatedCounts = { ...slotEmployeeCounts };

    // Update only the slots that are selected for this columnIndex
    selectedButtons.forEach(slot => {
      const [colIdx, btnIdx] = slot.split('-');
      if (parseInt(colIdx) === columnIndex) {
        updatedCounts[slot] = employeeCount[columnIndex];
      }
    });

    // Update state
    setSlotEmployeeCounts(updatedCounts);
    setSelectedButtons([]);

    // Create a new object for employeeCount while keeping all the old values
    const newEmployeeCount = { ...employeeCount };

    // Update only the value for the given columnIndex
    newEmployeeCount[columnIndex] = undefined;

    // Update state
    setEmployeeCount(newEmployeeCount);
  };


  useEffect(() => {
    const fetchTimeReqData = async () => {
      setIsLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/requirement/workforce?week_adjustment=${weekAdjustment}&selectedDepartment=${selectedDepartment}`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });

          const data = response.data;
          setTimeReqData(data);
          setDepartmentList(response.data.department_list);
          setSlotEmployeeCounts({});
          setSlotEmployeeCounts(prevState => {
            return {
              ...prevState,
              ...data.timereq_dict  // Merging existing employee counts with the fetched default values
            };
          });

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
          if (error.response.status === 401 || error.response.status === 500) {
            navigate('/login');
          }
        }
    };

    fetchTimeReqData();
  }, [weekAdjustment, token, selectedDepartment]);

  const goToNextWeek = () => {
    setWeekAdjustment(weekAdjustment + 7);
  };

  const goToPreviousWeek = () => {
    setWeekAdjustment(weekAdjustment - 7);
  };
  const applyTemplate1 = () => {
    const updatedCounts = { ...slotEmployeeCounts };

    Array.from({ length: timereqData.day_num }).forEach((_, columnIndex) => {
      Array.from({ length: timereqData.daily_slots }).forEach((_, btnIndex) => {
        const currentTimeMinutes = convertTimeToMinutes(timereqData.slots_dict[btnIndex]);
        const openingTimeMinutes = convertTimeToMinutes(openingHours[columnIndex]);
        const startBreakTimeMinutes = convertTimeToMinutes(startBreak[columnIndex]) - 1;
        const endBreakTimeMinutes = convertTimeToMinutes(endBreak[columnIndex]);
        const closingTimeMinutes = convertTimeToMinutes(closingHours[columnIndex]) - 1;

        if (isTimeWithinRange(currentTimeMinutes, openingTimeMinutes, startBreakTimeMinutes, endBreakTimeMinutes, closingTimeMinutes)) {
          const key = `${columnIndex}-${btnIndex}`;
          updatedCounts[key] = timereqData.template1_dict[key];
        }
      });
    });
    setSlotEmployeeCounts(updatedCounts);
  };

  const applyTemplate2 = () => {
    const updatedCounts = { ...slotEmployeeCounts };

    Array.from({ length: timereqData.day_num }).forEach((_, columnIndex) => {
      Array.from({ length: timereqData.daily_slots }).forEach((_, btnIndex) => {
        const currentTimeMinutes = convertTimeToMinutes(timereqData.slots_dict[btnIndex]);
        const openingTimeMinutes = convertTimeToMinutes(openingHours[columnIndex]);
        const startBreakTimeMinutes = convertTimeToMinutes(startBreak[columnIndex]) - 1;
        const endBreakTimeMinutes = convertTimeToMinutes(endBreak[columnIndex]);
        const closingTimeMinutes = convertTimeToMinutes(closingHours[columnIndex]) - 1;

        if (isTimeWithinRange(currentTimeMinutes, openingTimeMinutes, startBreakTimeMinutes, endBreakTimeMinutes, closingTimeMinutes)) {
          const key = `${columnIndex}-${btnIndex}`;
          updatedCounts[key] = timereqData.template2_dict[key];
        }
      });
    });

    setSlotEmployeeCounts(updatedCounts);
  };

  const applyTemplate3 = () => {
    const updatedCounts = { ...slotEmployeeCounts };

    Array.from({ length: timereqData.day_num }).forEach((_, columnIndex) => {
      Array.from({ length: timereqData.daily_slots }).forEach((_, btnIndex) => {
        const currentTimeMinutes = convertTimeToMinutes(timereqData.slots_dict[btnIndex]);
        const openingTimeMinutes = convertTimeToMinutes(openingHours[columnIndex]);
        const startBreakTimeMinutes = convertTimeToMinutes(startBreak[columnIndex]) - 1;
        const endBreakTimeMinutes = convertTimeToMinutes(endBreak[columnIndex]);
        const closingTimeMinutes = convertTimeToMinutes(closingHours[columnIndex]) - 1;

        if (isTimeWithinRange(currentTimeMinutes, openingTimeMinutes, startBreakTimeMinutes, endBreakTimeMinutes, closingTimeMinutes)) {
          const key = `${columnIndex}-${btnIndex}`;
          updatedCounts[key] = timereqData.template3_dict[key];
        }
      });
    });

    setSlotEmployeeCounts(updatedCounts);
  };

  const handleFormSubmit = async (buttonName) => {
    if (!selectedDepartment) {
      // Display an error message or handle the missing selection appropriately
      setShowMissingNotification(true);
      return; // Prevent the form from submitting
    }
    try {
      console.log(slotEmployeeCounts)
      const payload = {};
      Object.entries(slotEmployeeCounts).forEach(([key, count]) => {
        if (count !== undefined) { // Check if count is not undefined
            const [columnIndex, btnIndex] = key.split('-');
            const dayNum = columnIndex; // Assuming columnIndex starts from 0
            const currentTime = timereqData.slots_dict[parseInt(btnIndex)];
            const newKey = `worker_${dayNum}_${currentTime}`;
            payload[newKey] = count.toString();
          }
      });
      payload["button"] = buttonName;
      payload["template_name"] = selectedTemplate;
      payload["department"] = selectedDepartment;
      // Send the updated form values to the server for database update
      console.log("Final payload before sending to server:", payload);
      await axios.post(`${API_BASE_URL}/api/requirement/workforce?week_adjustment=${weekAdjustment}&selectedDepartment=${encodeURIComponent(selectedDepartment)}`, payload, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        }
    });
      setShowSuccessNotification(true);
      console.log("Sending this data to server:", payload);
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
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', marginBottom: '1rem' }}>
        <FormControl fullWidth variant="filled"sx={{ width: '250px' }}>
          <InputLabel id="department-label">Abteilung</InputLabel>
          <Select
            labelId="department-label"
            id="department"
            name="department"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            inputProps={{ maxLength: 30 }}
            required
            sx={{
              color: "black",
              marginRight: '0.2rem',
              height: '40px', // explicitly set height
              '.MuiInputBase-root': {
                height: '20px', // explicitly set input field height
                fontSize: '10px' // explicitly set font size
              },
              '.MuiSelect-icon': { // Change color of icon to black
                color: 'black',
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
      </FormControl>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
        <IconButton 
          onClick={goToPreviousWeek} 
          style={BUTTON_STYLE}>
          <ChevronLeft style={{ color: '#2E2E2E' }} />
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
          <ChevronRight style={{ color: '#2E2E2E' }}/>
        </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', marginBottom: '1rem' }}>
        <Button 
          variant="outlined"
          color="inherit"
          size="small"
          onClick={applyTemplate1}
          sx={{
            marginRight: '0.2rem',
            borderColor: 'white',
            height: '20px',
            minHeight: '20px',
            fontSize: '10px',
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
          }}
        >
          Template 1
        </Button>
        <Button 
          variant="outlined"
          color="inherit"
          size="small"
          onClick={applyTemplate2}
          sx={{
            marginRight: '0.2rem',
            borderColor: 'white',
            height: '20px',
            minHeight: '20px',
            fontSize: '10px',
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
          }}
        >
          Template 2
        </Button>
        <Button 
          variant="outlined"
          color="inherit"
          size="small"
          onClick={applyTemplate3}
          sx={{
            marginRight: '0.2rem',
            borderColor: 'white',
            height: '20px',
            minHeight: '20px',
            fontSize: '10px',
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
          }}
        >
          Template 3
        </Button>
        <Tooltip 
          title={
          <>
          <span style={{ fontWeight: 'bold' }}>Speicher deine Vorlage</span><br />
          <br />
          1. Trage deine Verfügbarkeiten unten ein<br />
          2. Wähle einen Vorlagenamen aus der Drop-Down Liste<br />
          3.Speicher deine Vorlage über den Save Template Knopf</>}>
          <InfoOutlinedIcon style={{ color: 'black' }} />
        </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', marginBottom: '1rem' }}>
        <Button 
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => handleFormSubmit("Save Template")}
              sx={{
                marginRight: '0.2rem',
                borderColor: 'white',
                height: '20px',
                minHeight: '20px',
                fontSize: '10px',
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
              }}
            >
              Save Template
            </Button>
            <Select 
                type="text"
                size="small"
                name="template_name"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                inputProps={{ maxLength: 30 }}
                sx={{
                  color: "black",
                  marginRight: '0.2rem',
                  height: '20px', // explicitly set height
                  '.MuiInputBase-root': {
                    height: '20px', // explicitly set input field height
                    fontSize: '10px' // explicitly set font size
                  },
                  '.MuiSelect-icon': { // Change color of icon to black
                    color: 'black',
                }, 
                }}
              >
                <MenuItem value={ 'Template 1' }>Template 1</MenuItem>
                <MenuItem value={ 'Template 2' }>Template 2</MenuItem>
                <MenuItem value={ 'Template 3' }>Template 3</MenuItem>
                </Select>
        </Box>
        <span></span>
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
                    }}>
              <Typography variant="h5" gutterBottom component="div">
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
                sx={{ marginBottom: '10px', marginTop: '10px' }} 
              >
                Enter
              </Button>

              <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%', // Full width
                    height: 500, // Set a fixed height
                    overflowY: 'auto', // To allow scrolling if the content exceeds the fixed height
                    border: '1px solid', // To visualize the box
                  }}>

                {Array.from({ length: timereqData.daily_slots }).map((_, btnIndex) => {

                  const timereqKey = `${columnIndex}-${btnIndex}`;
                  const timereqValue = slotEmployeeCounts[timereqKey] || '';
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

                    const buttonStyle = () => {
                      if (isEntered && isSelected) {
                        return {
                          variant: "contained",
                          color: "secondary"
                        };
                      }
                      if (isEntered) {
                        return {
                          variant: "contained",
                          color: "success"
                        };
                      }
                      if (isSelected) {
                        return {
                          variant: "contained",
                          color: "secondary"
                        };
                      }
                      return {
                        variant: "outlined",
                        color: "inherit"
                      };
                    };
                    
                    return (
                      <Button
                        key={`btn-${btnIndex}`}
                        variant={buttonStyle().variant}
                        color={buttonStyle().color}
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
                          "&.MuiButtonOutlined": {
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
                          width: '100%', // Full width
                          
                        }}
                      >
                      {`${timereqData.slots_dict && timereqData.slots_dict[btnIndex]}`}
                      {!isEntered && <span>&nbsp;&nbsp;&nbsp;{timereqValue}</span>}
                      {isEntered && <span>&nbsp;&nbsp;&nbsp;{employeeCountForThisSlot}</span>}
                      </Button>
                    ); 
                  }
                    return null; // Return null if the current time is outside the opening and closing hours
                  })}

                </Box>
            </Box>

            ))}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
          <Button 
            variant="outlined"
            color="primary"
            onClick={() => handleFormSubmit("Submit")}
            sx={{
              borderColor: 'black',
              '&.MuiButtonOutlined': {
                borderColor: 'white',
              },
              '&:hover': {
                borderColor: 'black',
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
        open={showMissingNotification}
        onClose={() => setShowMissingNotification(false)}
        message="Please select a Department"
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