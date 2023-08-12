import React, { useEffect, useRef, useState } from 'react';
import { Box } from "@mui/material";
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css'; // Import Gantt styles
import Header from "../../components/Header";
import gantt from 'dhtmlx-gantt'; // Import the Gantt library
import { createEvents } from 'ics'; // Import the createEvents function from ics library
import jsPDF from 'jspdf';

const MyGanttChart = () => {
  const containerRef = useRef(null);
  const [currentView, setCurrentView] = useState('day'); // 'day', 'week', 'month'

  useEffect(() => {
    if (containerRef.current) {
      // Initialize Gantt chart
      gantt.config.xml_date = '%Y-%m-%d %H:%i:%s';
      gantt.config.readonly = true; // Disable editing interactions
      gantt.config.buttons_left = []; // Remove "Add Task" button
      gantt.config.lightbox.sections = []; // Remove lightbox sections (for task editing)

      // Set up timeline configuration based on the current view
      const timelineConfig = {
        day: { scale_unit: 'hour', step: 1, date: '%H:%i' }, // Show hours
        week: { scale_unit: 'day', step: 1, date: '%d %M' }, // Show days
        month: { scale_unit: 'month', step: 1, date: '%F' }
      };

      gantt.config.scale_unit = timelineConfig[currentView].scale_unit;
      gantt.config.step = timelineConfig[currentView].step;
      gantt.config.date_scale = timelineConfig[currentView].date;

      gantt.init(containerRef.current);

      // Define tasks and links
      const tasks = [
        { id: 1, text: 'Shift 1', start_date: '2022-08-08 08:00', end_date: '2022-08-08 12:00' }, // Example: Show in hours
        { id: 2, text: 'Shift 2', start_date: '2022-08-09 10:00', end_date: '2022-08-09 14:00' }, // Example: Show in hours
        // Add more shifts
      ];

      const links = [
        // Add your links here
      ];

      gantt.parse({ data: tasks, links });

      // Clean up function
      return () => {
        gantt.clearAll();
      };
    }
  }, [currentView]);

  const switchToDayView = () => {
    setCurrentView('day');
  };

  const switchToWeekView = () => {
    setCurrentView('week');
  };

  const switchToMonthView = () => {
    setCurrentView('month');
  };

  const exportAsPDF = () => {
    const ganttContainer = containerRef.current;
    const pdf = new jsPDF('p', 'pt', 'a4');

    pdf.html(ganttContainer, {
      callback: () => {
        pdf.save('gantt_chart.pdf');
      },
    });
  };

  const exportToOutlook = () => {
    const events = [
      { start: [2022, 8, 8, 8, 0], end: [2022, 8, 8, 12, 0], title: 'Shift 1' },
      { start: [2022, 8, 9, 10, 0], end: [2022, 8, 9, 14, 0], title: 'Shift 2' },
      // Add more events
    ];

    const { error, value } = createEvents(events);
    if (!error) {
      const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'shifts.ics';
      link.click();
    }
  };

  return (
    <Box m="20px">
      <Header title="Shift Plan" subtitle="Overview of scheduled shifts for members" />
      <div>
        <button onClick={switchToDayView}>Day View</button>
        <button onClick={switchToWeekView}>Week View</button>
        <button onClick={switchToMonthView}>Month View</button>
        <button onClick={exportAsPDF}>Export as PDF</button>
        <button onClick={exportToOutlook}>Export to Outlook</button>
      </div>
      <div style={{ position: 'relative' }}>
        <Box ref={containerRef} style={{ height: '400px' }} />
      </div>
    </Box>
  );
};

export default MyGanttChart;
