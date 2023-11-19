import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
    useTheme,
  } from "@mui/material";
import Header from "../../components/Header";
import axios from 'axios';
import Timeline from 'react-calendar-timeline';
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import { API_BASE_URL } from "../../config";
import { ThreeDots } from "react-loader-spinner";
import './GanttChart.css';


const GanttChart = () => {
  const [shifts, setShifts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('session_token');
  const [timelineBounds, setTimelineBounds] = useState({ start: moment(), end: moment() });

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
            id: user.email, // Assuming email is unique for each user
            title: `${user.first_name} ${user.last_name}`
        }));
  
        setShifts(timelineItems);
        setGroups(timelineGroups);
        setTimelineBounds({ start: minStartTime, end: maxEndTime });
      } catch (error) {
        console.error('Error fetching shift data:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchShifts();
  }, [token]);
  

  return (
    <Box m="20px" className="gantt-chart-container">
      <Header title="Schichtplan" subtitle="Schichtplan blabla" />
    <div>
      {isLoading ? (
        <ThreeDots color="#2BAD60" height={80} width={80} />
      ) : (
        <Timeline
          groups={groups}
          items={shifts}
          defaultTimeStart={timelineBounds.start}
          defaultTimeEnd={timelineBounds.end}
          canMove={false}
          canResize={false}
          // Apply inline styles to the container of the timeline
          style={{ color: 'black', backgroundColor: 'white' }}
        />
      )}
    </div>
    </Box>
  );
}

export default GanttChart;
