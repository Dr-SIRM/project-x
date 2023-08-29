import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './plan.css';
import { Box } from "@mui/material";
import Header from "../../components/Header";

const GanttChart = () => {
  const [view, setView] = useState('day');
  const [shifts, setShifts] = useState([]);
  console.log("Shifts:", shifts);
  const token = localStorage.getItem('session_token');
  const [openingHours, setOpeningHours] = useState({});

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schichtplanung', {
          headers: { Authorization: `Bearer ${token}` },
          params: { view: view }
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
  }, [view]);
  
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
    const today = new Date();
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
        case 'week':
            maxDuration = 7 * 24; // 7 days * 24 hours
            left = ((today.getDay() * 24) + shiftStartHour) / maxDuration * 100;
            width = (shiftEndHour - shiftStartHour) / maxDuration * 100;
            break;
        case 'month':
            maxDuration = 30 * 24; // 30 days * 24 hours
            left = ((today.getDate() - 1) * 24 + shiftStartHour) / maxDuration * 100;
            width = (shiftEndHour - shiftStartHour) / maxDuration * 100;
            break;
        default:
            return { left: 0, width: 0 }; 
    }

    return { left: `${left}%`, width: `${width}%` };
};


  const renderShifts = (worker) => {
    let maxDuration;
    const today = new Date();
  
    switch (view) {
      case 'day':
        maxDuration = getWorkingHoursDuration(today);
        break;
      case 'week':
        maxDuration = 7 * getWorkingHoursDuration(today); // You can adjust this to sum up different hours of different days if necessary
        break;
      case 'month':
        maxDuration = 30 * getWorkingHoursDuration(today); // Again, can adjust for varying days
        break;
      default:
        maxDuration = 24; // default to 24 hours
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
    const today = new Date();
    const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
    const hours = openingHours[weekday.toLowerCase()];


    if (!hours || view !== 'day') {
      switch (view) {
        case 'week':
          return Array.from({ length: 7 }).map((_, index) => {
            const date = new Date(today);
            date.setDate(today.getDate() - today.getDay() + index);
            return formatDate(date);
          });
        case 'month':
          const currentMonth = new Date();
          return Array.from({ length: 30 }).map((_, index) => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index + 1);
            return formatDate(date, true);
          });
        default:
          return [];
      }
    }

    const startHour = parseInt(hours.start.split(":")[0], 10);
    const endHour = parseInt(hours.end.split(":")[0], 10);
    const hoursArray = Array.from({ length: endHour - startHour + 1 }).map((_, index) => startHour + index);

    const timelineLabels = hoursArray.map(hour => formatTime(hour));
    return timelineLabels;
  };

  return (
    <Box m="20px">
      <Header
        title="Schichtplan"
        subtitle=""
      />
      <h2>Übersicht über die eingeplanten Schichten</h2>
      <div className="gantt-container">
        <div className="gantt-controls">
          <button onClick={() => setView('day')}>Day</button>
          <button onClick={() => setView('week')}>Week</button>
          <button onClick={() => setView('month')}>Month</button>
        </div>
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
      </div>
    </Box>
  );
};

export default GanttChart;
