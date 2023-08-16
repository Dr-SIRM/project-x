import React, { useState } from 'react';
import './plan.css';

const GanttChart = () => {
  const [view, setView] = useState('day');
  const shifts = [
      { worker: 'Mitarbeiter A', start: new Date(2023, 7, 16, 8), end: new Date(2023, 7, 16, 100) },
      { worker: 'Mitarbeiter B', start: new Date(2023, 7, 16, 10), end: new Date(2023, 7, 16, 145) },
      { worker: 'Mitarbeiter C', start: new Date(2023, 7, 17, 9), end: new Date(2023, 7, 17, 135) },
      { worker: 'Mitarbeiter D', start: new Date(2023, 7, 18, 11), end: new Date(2023, 7, 18, 90) },
  ];

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
    );
};

export default GanttChart;
