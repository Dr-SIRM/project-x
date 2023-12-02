import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
    useTheme,
    IconButton
  } from "@mui/material";
import Header from "../../components/Header";
import axios from 'axios';
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import { API_BASE_URL } from "../../config";
import { ThreeDots } from "react-loader-spinner";
import './GanttChart.css';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';



const GanttChart = () => {
  const [shifts, setShifts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('session_token');
  const [timelineBounds, setTimelineBounds] = useState({ start: moment(), end: moment() });
  const [timelineKey, setTimelineKey] = useState(0);
  const [currentView, setCurrentView] = useState('week');
  const setDayView = () => {
    const startOfDay = moment().startOf('day').hour(0).minute(0).second(0);
    const endOfDay = moment().startOf('day').hour(23).minute(59).second(59);
  
    // console.log('Day View - Start:', startOfDay.toString(), 'End:', endOfDay.toString());
    setCurrentView('day');
    setTimelineBounds({ start: startOfDay, end: endOfDay });
    setTimelineKey(prevKey => prevKey + 1); // Update key to force re-render
  };
  
  
  

  const setWeekView = () => {
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().startOf('week').add(1, 'week');
    setCurrentView('week');
    setTimelineBounds({ start: startOfWeek, end: endOfWeek });
    setTimelineKey(prevKey => prevKey + 1); // Update key to force re-render
  };
  const goToNext = () => {
    const amount = currentView === 'day' ? 1 : 7;
    setTimelineBounds({
      start: timelineBounds.start.clone().add(amount, 'days'),
      end: timelineBounds.end.clone().add(amount, 'days')
    });
    setTimelineKey(prevKey => prevKey + 1);
  };
  const goToPrevious = () => {
    const amount = currentView === 'day' ? 1 : 7;
    setTimelineBounds({
      start: timelineBounds.start.clone().subtract(amount, 'days'),
      end: timelineBounds.end.clone().subtract(amount, 'days')
    });
    setTimelineKey(prevKey => prevKey + 1);
  };
  

  useEffect(() => {
    const fetchShifts = async () => {
      setIsLoading(true);
  
      try {
        const response = await axios.get(`${API_BASE_URL}/api/schichtplanung2`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Transform the shift data
        const timelineItems = [];
        let minStartTime = moment().add(1, 'years'); // Far future date
        let maxEndTime = moment().subtract(1, 'years');
  
        response.data.shifts.forEach(shiftRecord => {
            shiftRecord.shifts.forEach((shift, index) => {
                if (shift.start_time && shift.end_time) {
                    const startTime = moment(`${shiftRecord.date} ${shift.start_time}`, 'YYYY-MM-DD HH:mm:ss');
                    let endTime = moment(`${shiftRecord.date} ${shift.end_time}`, 'YYYY-MM-DD HH:mm:ss');
  
                    // Adjust if shift ends after midnight
                    if (endTime.isBefore(startTime)) {
                        endTime.add(1, 'days');
                    }
  
                    const shiftId = `${shiftRecord.email}-${shiftRecord.date}-${index}`;
  
                    timelineItems.push({
                        id: shiftId,
                        group: shiftRecord.email,
                        title: `${shiftRecord.first_name} ${shiftRecord.last_name} (${shift.start_time} - ${shift.end_time})`,
                        start_time: startTime,
                        end_time: endTime
                    });
  
                    if (startTime.isBefore(minStartTime)) {
                        minStartTime = startTime;
                    }
                    if (endTime.isAfter(maxEndTime)) {
                        maxEndTime = endTime;
                    }
                }
            });
        });
  
        const timelineGroups = response.data.users.map(user => ({
            id: user.email, 
            title: `${user.first_name} ${user.last_name}`
        }));
  
        setShifts(timelineItems);
        setGroups(timelineGroups);
        setTimelineBounds({ start: minStartTime, end: maxEndTime });
      } catch (error) {
        // console.error('Error fetching shift data:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchShifts();
  }, [token]);
  

  return (
    <Box m="20px" className="gantt-chart-container">
      <Header title="Schichtplan" subtitle="Schichtplan blabla" />
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <IconButton onClick={goToPrevious} color="primary">
          <ArrowBackIosIcon />
        </IconButton>
        <Button onClick={setDayView} variant="contained" color="primary" sx={{ mx: 2 }}>
          Day View
        </Button>
        <Button onClick={setWeekView} variant="contained" color="primary" sx={{ mx: 2 }}>
          Week View
        </Button>
        <IconButton onClick={goToNext} color="primary">
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
      <div>
        {isLoading ? (
          <ThreeDots color="#2BAD60" height={80} width={80} />
        ) : (
          <Timeline
            key={timelineKey}
            groups={groups}
            items={shifts}
            defaultTimeStart={timelineBounds.start}
            defaultTimeEnd={timelineBounds.end}
            canMove={false}
            canResize={false}
            style={{ color: 'black', backgroundColor: 'white' }}
          />
        )}
      </div>
    </Box>
  );
}

export default GanttChart;
