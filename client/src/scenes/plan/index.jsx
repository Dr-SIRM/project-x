import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './plan.css';
import { Box, IconButton } from "@mui/material";
import Header from "../../components/Header";
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

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
        const response = await axios.get('http://localhost:5000/api/schichtplanung', {
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

  
  const getWorkingHoursDuration = () => {
    const today = new Date();
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = openingHours[weekday.toLowerCase()];
    
    if (!hours) return 24; // Default to 24 hours if no hours are specified
  
    const startHour = parseInt(hours.start.split(":")[0], 10);
    const endHour = parseInt(hours.end.split(":")[0], 10);
    
    return endHour - startHour; // Return difference in hours
  };

  const getShiftPosition = (shift) => {
    const today = currentDay;
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = openingHours[weekday.toLowerCase()];

    if (!hours) {
        return { left: 0, width: 0 }; // Default values if no hours are specified
    }

    const startHour = parseInt(hours.start.split(":")[0], 10);
    const endHour = parseInt(hours.end.split(":")[0], 10);
    
    const shiftStartHour = parseInt(shift.start_time.split(":")[0], 10);
    const shiftEndHour = parseInt(shift.end_time.split(":")[0], 10);

    let maxDuration, left, width;
    switch (view) {
        case 'day':
            maxDuration = endHour - startHour; 
            left = (shiftStartHour - startHour) / maxDuration * 100;
            width = (shiftEndHour - shiftStartHour) / maxDuration * 100;
            break;
        default:
            return { left: 0, width: 0 }; 
    }

    return { left: `${left}%`, width: `${width}%` };
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
        console.log(`Start time for shift: ${shift.start_time}`);
        console.log(`End time for shift: ${shift.end_time}`);
    
        if (shift.start_time && shift.end_time) {
          validShifts.push({
            ...shiftData,
            start_time: shift.start_time,
            end_time: shift.end_time,
          });
        }
      });
    });
  
    return (
      <div className="gantt-bar-container">
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
    const today = currentDay;
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
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
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
    //this part only to debug
    const formattedDate = day.toISOString().split('T')[0];
    const shiftsForDay = shifts.filter(shift => shift.date === formattedDate);
    
    // Log the shifts for the given day
    console.log("Shifts for day " + formattedDate + ":", shiftsForDay);
    //until here---------
    if (!(day instanceof Date)) {
      console.error('day is not a Date instance:', day);
      return [];
    }

    const dateString = day.toISOString().split('T')[0];
    return shifts.filter(worker => 
        worker.shifts.some(shift => 
          (shift.start_time && shift.start_time.includes(dateString)) || 
          (shift.end_time && shift.end_time.includes(dateString))
        )
    );
};

  
const renderWeekShifts = (day) => {
  const shiftsForDay = getShiftsForDay(day);
  //this part only to debug
  const dayShifts = getShiftsForDay(day);
  console.log("Rendering shifts for:", day, dayShifts);
  // until here----
  
  return (
    <div key={day.toISOString()}>
      {shiftsForDay.map(worker => (
        <div key={`${worker.first_name}-${worker.last_name}`}>
          <div>{`${worker.first_name} ${worker.last_name}`}</div>
          {worker.shifts.map((shift, index) => (
            <div key={index}>
              Start: {shift.start_time.split('T')[1]} - Ende: {shift.end_time.split('T')[1]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

  
  
  
  const startOfWeek = getStartOfWeek(currentDay);
  const endOfWeek = getEndOfWeek(currentDay);

  console.log('Start of Week:', startOfWeek);
  console.log('End of Week:', endOfWeek);

  const days = daysOfWeek(startOfWeek, endOfWeek);
  console.log('Days of Week:', days);



  return (
    <Box m="20px">
      <Header
        title="Schichtplan"
        subtitle=""
      />
      <h2>Übersicht über die eingeplanten Schichten</h2>
      <div className="gantt-container">
        <div>
          <div className="gantt-controls">
            <div className="view-controls">
              <button onClick={() => setView('day')}>Tag</button>
              <button onClick={() => setView('week')}>Woche</button>
            </div>
          </div>
          {view === 'day' && (
            <div className="date-navigation">
              <IconButton onClick={goToPrevDay} style={BUTTON_STYLE}>
                <ChevronLeft />
              </IconButton>
              <span className="date-display">{formatDateDisplay(currentDay)}</span>
              <IconButton onClick={goToNextDay} style={BUTTON_STYLE}>
                <ChevronRight />
              </IconButton>
            </div>
          )}
        </div>
        {view === 'day' && ( // This line ensures timeline is only shown for 'day' view
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
          <h3 className="week-view-header">Woche {getWeekNumber(currentDay)}</h3>
          <div className="weekdays">
            {daysOfWeek(getStartOfWeek(currentDay), getEndOfWeek(currentDay)).map((day, index) => {
              const shiftsForDay = getShiftsForDay(day);
              return (
                <div className="weekday-box" key={index}>
                  <div className="weekday-title">{day.toLocaleDateString('en-US', { weekday: 'long' })}</div>
                  <div className="weekday-date">{day.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                  
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
