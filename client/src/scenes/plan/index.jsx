import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './plan.css';
import { Box, IconButton, Button, Typography } from "@mui/material";
import Header from "../../components/Header";
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { ThreeDots } from "react-loader-spinner"; 
import { API_BASE_URL } from "../../config";

const GanttChart = () => {
  const [view, setView] = useState('day');
  const [shifts, setShifts] = useState([]);
  console.log("Shifts:", shifts);
  const token = localStorage.getItem('session_token');
  const [openingHours, setOpeningHours] = useState({});
  const [currentDay, setCurrentDay] = useState(new Date());
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
  
  useEffect(() => {
    const fetchWorkers = async () => {
      console.log('Making request with view:', view);
      console.log('Making request with currentDate:', currentDay.toISOString().split('T')[0]);
      const dayString = currentDay.toISOString().split('T')[0];

      // Use the existing "currentDay" as per your request
      const startDate = getStartOfWeek(currentDay).toISOString().split('T')[0];
      const endDate = getEndOfWeek(currentDay).toISOString().split('T')[0];
      
      try {
        const response = await axios.get(`${API_BASE_URL}/api/schichtplanung`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { 
            view: view,
            ...(view === 'day' && { specific_day: currentDay.toISOString().split('T')[0] }),
            ...(view === 'week' && { start_date: startDate, end_date: endDate })

          }
        });
        const responseData = response.data;
        console.log("API Response Data:", responseData);
  
        if (responseData && responseData.shifts) {
          const workerMap = new Map();
  
          responseData.shifts.forEach(shift => {
            const key = `${shift.first_name} ${shift.last_name}`;
            const worker = workerMap.get(key);
  
            if (worker) {
              worker.shifts.push(shift);
            } else {
              workerMap.set(key, {
                first_name: shift.first_name,
                last_name: shift.last_name,
                shifts: [shift]
              });
            }
          });
  
          setShifts([...workerMap.values()]);
        }
        
        if (responseData && responseData.opening_hours) {
          setOpeningHours(responseData.opening_hours);
        } else {
          console.error('Invalid response format:', responseData);
        }
      } catch (error) {
        console.error('Error fetching workers:', error);
      }
    };
  
    fetchWorkers();
  }, [view, currentDay]);
  
  const formatDate = (date, omitYear = false) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    if (omitYear) {
      return `${day}.${month}`;
    }
    
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };
  
  const formatTime = (hour) => {
    return hour.toString().padStart(2, '0') + ":00";
  };

  //DAY VIEW
  const getWorkingHoursDuration = () => {
    const today = new Date();
    const weekday = today.toLocaleDateString('de-DE', { weekday: 'long' });
    const hours = openingHours[weekday.toLowerCase()];
    console.log("Stunden:", hours)
    
    if (!hours) return 24; // Default to 24 hours if no hours are specified
  
    const startHour = parseInt(hours.start.split(":")[0], 10);
    const endHour = parseInt(hours.end.split(":")[0], 10);
    
    return endHour - startHour; // Return difference in hours
  };

  const getShiftPosition = (shift) => {
    const today = currentDay;
    const weekday = today.toLocaleDateString('de-DE', { weekday: 'long' });
    const hours = openingHours[weekday.toLowerCase()];

    if (!hours) {
        return { left: 0, width: 0 }; // Default values if no hours are specified
    }

    const startHourMinutes = hours.start.split(":").map(Number);
    const endHourMinutes = hours.end.split(":").map(Number);
    const shiftStartHourMinutes = shift.start_time.split(":").map(Number);
    const shiftEndHourMinutes = shift.end_time.split(":").map(Number);

    const startMinutes = startHourMinutes[0] * 60 + startHourMinutes[1];
    const endMinutes = endHourMinutes[0] * 60 + endHourMinutes[1];
    const shiftStartMinutes = shiftStartHourMinutes[0] * 60 + shiftStartHourMinutes[1];
    const shiftEndMinutes = shiftEndHourMinutes[0] * 60 + shiftEndHourMinutes[1];

    let maxDuration, left, width;
    switch (view) {
        case 'day':
            maxDuration = endMinutes - startMinutes;
            left = (shiftStartMinutes - startMinutes) / maxDuration * 100;
            width = (shiftEndMinutes - shiftStartMinutes) / maxDuration * 100;
            break;
        default:
            return { left: 0, width: 0 }; 
    }

    return { left: `${left}%`, width: `${width}%` };
};

const getCurrentTimePercentage = () => {
  const today = new Date(currentDay);
  const weekday = today.toLocaleDateString('de-DE', { weekday: 'long' });
  const hours = openingHours[weekday.toLowerCase()];
  
  if (!hours) {
      return 0; // Default value if no hours are specified
  }

  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const startHour = parseInt(hours.start.split(":")[0], 10);
  const endHour = parseInt(hours.end.split(":")[0], 10);
  const totalDuration = endHour - startHour;
  const pastDuration = currentHour - startHour + currentMinute / 60;
  return (pastDuration / totalDuration) * 100;
};




const renderShifts = (worker) => {
  let maxDuration;
  const today = currentDay;

  switch (view) {
      case 'day':
          maxDuration = getWorkingHoursDuration(today);
          break;
  }

  const validShifts = [];

  worker.shifts.forEach(shiftData => {
      const { shifts } = shiftData;
      shifts.forEach(shift => {
          if (shift.start_time && shift.end_time) {
              validShifts.push({
                  ...shiftData,
                  start_time: shift.start_time,
                  end_time: shift.end_time,
              });
          }
      });
  });
  console.log(validShifts)

  const currentTimePercentage = getCurrentTimePercentage();
  const currentTimeLineStyle = {
      left: `${currentTimePercentage}%`,
  };

  return (
      <div className="gantt-bar-container">
          <div className="current-time-line" style={currentTimeLineStyle}></div>
          {validShifts.map((shift, index) => (
              <div
                  key={index}
                  className="gantt-bar"
                  style={getShiftPosition(shift)}
              >
                  <div className="tooltip">
                      Start: {shift.start_time} - Ende: {shift.end_time}
                  </div>
              </div>
          ))}
      </div>
  );
};


  const getTimelineLabels = () => {
    const today = new Date(currentDay);
    const weekday = today.toLocaleDateString('de-DE', { weekday: 'long' });
    const hours = openingHours[weekday.toLowerCase()];


    if (!hours || view !== 'day') {
          return [];     
    }

    const startHour = parseInt(hours.start.split(":")[0], 10);
    const endHour = parseInt(hours.end.split(":")[0], 10);
    const hoursArray = Array.from({ length: endHour - startHour + 1 }).map((_, index) => startHour + index);

    const timelineLabels = hoursArray.map(hour => formatTime(hour));
    return timelineLabels;
  };

  const goToNextDay = () => {
    setCurrentDay(prevDay => {
      const nextDay = new Date(prevDay);
      nextDay.setDate(prevDay.getDate() + 1);
      return nextDay;
    });
  };
  
  const goToPrevDay = () => {
    setCurrentDay(prevDay => {
      const previousDay = new Date(prevDay);
      previousDay.setDate(prevDay.getDate() - 1);
      return previousDay;
    });
  };
  console.log(currentDay)
  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  


//Week VIEW
  const getStartOfWeek = (currentDay) => {
    const date = new Date(currentDay);  // Copy to avoid mutating the original date
    date.setDate(currentDay.getDate() - currentDay.getDay() + 1);  // Assuming week starts on Monday
    return date;
  };

  const getEndOfWeek = (currentDay) => {
    const date = new Date(currentDay);  // Copy to avoid mutating the original date
    date.setDate(currentDay.getDate() + (7 - currentDay.getDay()));  // Assuming week ends on Sunday
    return date;
  };

  const getWeekNumber = (currentDay) => {
    const date = new Date(currentDay);  // Copy to ensure we don't mutate the original date
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const millisecondsInWeek = 604800000; // Number of milliseconds in one week
    const dstOffsetStart = startOfYear.getTimezoneOffset();
    const dstOffsetDate = date.getTimezoneOffset();
    const offset = dstOffsetDate - dstOffsetStart;
    const sinceStartOfYear = date - startOfYear - offset * 60 * 1000;
    const weekNumber = Math.floor(sinceStartOfYear / millisecondsInWeek);
    return weekNumber;
  };

  const goToNextWeek = () => {
    setCurrentDay(prevDay => {
      const nextWeekStart = new Date(prevDay);
      nextWeekStart.setDate(prevDay.getDate() + 7);
      return nextWeekStart;
    });
  };
  
  const goToPrevWeek = () => {
    setCurrentDay(prevDay => {
      const prevWeekStart = new Date(prevDay);
      prevWeekStart.setDate(prevDay.getDate() - 7);
      return prevWeekStart;
    });
  };
  

  const daysOfWeek = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);  // Copy to ensure we don't mutate the original date
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

  const getShiftsForDay = (day) => {

    if (typeof day.toISOString() !== 'string') {
      console.error('The ISO string is not of type string:', day.toISOString());
      return [];
    }
    

    const isoString = day.toISOString();
    const formattedDate = isoString.split('T')[0];

    shifts.forEach(worker => {
        worker.shifts.forEach(shiftDetail => {
            if (shiftDetail.date === formattedDate) {
                console.log("Found worker with matching date:", worker);
                
                shiftDetail.shifts.forEach(shift => {
                    if (shift.start_time || shift.end_time) {
                        console.log("Shift for matched worker:", shift);
                    }
                });
            }
        });
    });
    
    // Filter shifts for the given day
    const workersWithShiftsForDay = shifts.filter(worker => 
      worker.shifts.some(shift => shift.date === formattedDate)
  );
        workersWithShiftsForDay.forEach(worker => {
          
          if (worker.date === formattedDate) {    
              worker.shifts.forEach(shift => {
                  if (shift.start_time) { // I've removed the condition to check formattedDate in start_time or end_time since it wasn't in the provided data structure. Adjust if necessary.
                  }
                  if (shift.end_time) {
                  }
              });
          } else {
              console.log("Date not matching for worker", worker.first_name, ":", worker.date);
          }
      });

    return workersWithShiftsForDay;
};
  
const renderWeekShifts = (day) => {
  const formattedDate = day.toISOString().split('T')[0];
  const shiftsForDay = getShiftsForDay(day);
  
  return (
    <div key={day.toISOString()}>
      {shiftsForDay.map(worker => (
        <div key={`${worker.first_name}-${worker.last_name}`}>
          <div className="worker-name">{`${worker.first_name} ${worker.last_name}`}</div>
          {worker.shifts.map(shiftDetail => {
            if (shiftDetail.date !== formattedDate) {
              return null; // Skip rendering shifts for other days
            }

            return shiftDetail.shifts.map((shift, index) => {

              // Directly assigning the start and end times
              const startTime = shift.start_time && typeof shift.start_time === 'string' 
                ? shift.start_time 
                : 'N/A';
              const endTime = shift.end_time && typeof shift.end_time === 'string' 
                ? shift.end_time 
                : 'N/A';

              // If both times are 'N/A', don't render this shift
              if (startTime === 'N/A' && endTime === 'N/A') {
                return null;
              }

              return (
                <div key={index}>
                  Start: {startTime} - Ende: {endTime}
                </div>
              );
            });
          })}
        </div>
      ))}
    </div>
  );
};

//export excel
const handleExportToExcel = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/download`, { 
      headers: {
        Authorization: `Bearer ${token}` ,
      },
      responseType: 'blob' 
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Schichtplan.xlsx');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('Failed to export data to Excel:', error);
  }
};



  return (
    <Box m="20px">
      <Header
        title="Schichtplan"
        subtitle="Übersicht über die eingeplanten Schichten"
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button variant="outlined"
                color="primary"
                size="small"
                onClick={handleExportToExcel} 
                sx={{
                  borderColor: 'black',
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
                }}>Export zu Excel</Button>
        
      </div>
      <div className="gantt-container">
        <div>
          <div className="gantt-controls">
            <div className="view-controls">
              <Button color="primary" variant="contained" sx={{ marginRight: '10px' }} onClick={() => setView('day')}>Tag</Button>
              <Button color="primary" variant="contained" sx={{ marginRight: '10px' }} onClick={() => setView('week')}>Woche</Button>
            </div>
          </div>
          {view === 'day' && (
            <div className="date-navigation">
              <IconButton onClick={goToPrevDay} style={BUTTON_STYLE}>
                <ChevronLeft style={{ color: 'black' }}/>
              </IconButton>
              <span className="date-display">{formatDateDisplay(currentDay)}</span>
              <IconButton onClick={goToNextDay} style={BUTTON_STYLE}>
                <ChevronRight style={{ color: 'black' }}/>
              </IconButton>
            </div>
          )}
        </div>
        {view === 'day' && ( 
          <>
            <div className="gantt-timeline">
              {getTimelineLabels().map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
            {shifts.map((workerShift, index) => (
              <div key={index} className="gantt-row">
                <div className="gantt-worker">{`${workerShift.first_name} ${workerShift.last_name}`}</div>
                {renderShifts(workerShift)}
              </div>
            ))}
          </>
        )}
      </div>
      {view === 'week' && (
        <div className="week-view">
          <div className="date-navigation">
            <IconButton onClick={goToPrevWeek} style={BUTTON_STYLE}>
              <ChevronLeft style={{ color: 'black' }} />
            </IconButton>
            <span className="date-display">Woche {getWeekNumber(currentDay)}</span>
            <IconButton onClick={goToNextWeek} style={BUTTON_STYLE}>
              <ChevronRight style={{ color: 'black' }} />
            </IconButton>
          </div>
          <div className="weekdays">
            {daysOfWeek(getStartOfWeek(currentDay), getEndOfWeek(currentDay)).map((day, index) => {    
              return (
                <div className="weekday-box" key={index}>
                  <div className="weekday-title">{day.toLocaleDateString('de-DE', { weekday: 'long' })}</div>
                  <div className="weekday-date">{day.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}</div>
                  <div className="weekday-separator"></div>
                  {/* Displaying the shifts for the day here */}
                  {renderWeekShifts(day)}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Box>
  );
}  
export default GanttChart;
