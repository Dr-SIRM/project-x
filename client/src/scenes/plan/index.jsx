import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './plan.css';
import { useTheme, Box, Button } from "@mui/material";
import Header from "../../components/Header";

const GanttChart = () => {
  const [view, setView] = useState('day');
  const [workers, setWorkers] = useState([]);
  const [shifts, setShifts] = useState([]);
  const token = localStorage.getItem('session_token');

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/schichtplanung', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const responseData = Array.isArray(response.data) ? response.data : JSON.parse(response.data);
        console.log(responseData);  // Add this line
        const workerShifts = responseData.map((worker) => ({
          worker: `${worker.first_name} ${worker.last_name}`,
          start: new Date(2023, 7, 16, 8),
          end: new Date(2023, 7, 16, 10)
        }));
        setWorkers(responseData);
        setShifts(workerShifts);
      } catch (error) {
        console.error('Error fetching workers:', error);
      }
    };
    
    fetchWorkers();
  }, []);

  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'short',
    });
  };

  const formatTime = (hour) => {
    const date = new Date();
    date.setHours(hour, 0, 0, 0);
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getShiftPosition = (shift, maxDuration) => {
    const startDate = new Date(shift.start.getFullYear(), shift.start.getMonth(), shift.start.getDate(), 0, 0, 0, 0);

    const startDifference = (shift.start - startDate) / 1000 / 60 / 60;
    const duration = (shift.end - shift.start) / 1000 / 60 / 60;

    const left = (startDifference / maxDuration) * 100;
    const width = (duration / maxDuration) * 100;

    return { left, width };
  };

  const getTimelineLabels = () => {
    const maxDuration = view === 'day' ? 24 : view === 'week' ? 7 * 24 : 30 * 24;

    switch (view) {
      case 'day':
        return Array.from({ length: 25 }).map((_, index) => formatTime(index % 24));
      case 'week':
        const today = new Date();
        return Array.from({ length: 7 }).map((_, index) => {
          const date = new Date(today);
          date.setDate(today.getDate() - today.getDay() + index);
          return formatDate(date);
        });
      case 'month':
        const currentMonth = new Date();
        return Array.from({ length: 30 }).map((_, index) => {
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), index + 1);
          return formatDate(date);
        });
      default:
        return [];
    }
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
        {shifts.map((shift, index) => (
          <div key={index} className="gantt-row">
            <div className="gantt-worker">{shift.worker}</div>
            <div className="gantt-bar-container">
              <div
                className="gantt-bar"
                style={getShiftPosition(shift, view === 'day' ? 24 : view === 'week' ? 7 * 24 : 30 * 24)}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default GanttChart;
