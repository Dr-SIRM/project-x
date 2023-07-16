import React, { useState } from 'react';
import { Box, Typography, TextField, ButtonGroup, Button } from '@mui/material';
import axios from 'axios';

// 24 hours * 4 slots/hour = 96 slots
const slots = Array.from({ length: 96 }, (_, i) => ({
  id: i,
  time: `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
}));

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Day = ({ day, slotCounts, setSlotCounts }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);

  const selectSlot = (slot) => {
    setSelectedSlots(prevSlots => {
      if (prevSlots.includes(slot)) {
        return prevSlots.filter(s => s !== slot);
      } else {
        return [...prevSlots, slot];
      }
    });
  };

  const setEmployees = (event) => {
    setEmployeeCount(Math.max(0, event.target.value));
  };

  const enter = () => {
    selectedSlots.forEach(slot => {
      setSlotCounts(prevCounts => ({
        ...prevCounts,
        [day]: {
          ...prevCounts[day],
          [slot]: { startTime: slots[slot].time, worker: employeeCount }
        }
      }));
    });
    setSelectedSlots([]);
    setEmployeeCount(0);
  };

  return (
    <Box sx={{ m: 2, p: 1, border: 1, borderColor: 'divider' }}>
      <Typography variant="h4" gutterBottom component="div">
        {day}
      </Typography>
      <TextField 
        type="number" 
        value={employeeCount} 
        onChange={setEmployees} 
        label="Enter employee count" 
        variant="outlined"
        fullWidth
        inputProps={{ min: 0 }}
      />
      <Button 
        variant="contained" 
        color="primary" 
        onClick={enter} 
        sx={{ 
          p: 0.2,
          m: 1,
          borderColor: 'white',
          borderWidth: 0.05,
          borderStyle: 'solid',
          backgroundColor: '#2e7c67',
          color: 'white',
          '&:hover': { 
            backgroundColor: 'darkpurple',
          },
        }}
      >
        Enter
      </Button>
      <Box sx={{ overflowY: 'auto', maxHeight: '450px' }}>
      <ButtonGroup orientation="vertical" fullWidth>
        {slots.map(slot => {
          const isSelected = selectedSlots.includes(slot.id);
          const isEntered = slotCounts[day] && slotCounts[day][slot.id];
          return (
            <Button 
              variant={isEntered ? 'text' : (isSelected ? 'contained' : 'outlined')}
              color={isEntered ? 'error' : (isSelected ? 'success' : 'inherit')}
              onClick={() => selectSlot(slot.id)}
              key={slot.id}
              sx={{
                borderColor: 'white', 
                '&.MuiButton-outlined': {
                  borderColor: 'white',
                },
                '&:hover': {
                  borderColor: 'white',
                },
                '&.MuiButton-text': {
                  borderColor: 'white',
                  color: 'white',
                  backgroundColor: '#2e7c67',
                }
              }}
            >
              {slot.time}
              {isEntered && <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{slotCounts[day][slot.id].worker}</span>}
            </Button>
          );
        })}
      </ButtonGroup>

      </Box>
    </Box>
  );
};

const Week = () => {
  const [slotCounts, setSlotCounts] = useState({});

  const submit = async () => {
    try {
      const token = localStorage.getItem('session_token');
      const currentDate = new Date();
      for (const [day, slots] of Object.entries(slotCounts)) {
        for (const [_, slotData] of Object.entries(slots)) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + weekDays.indexOf(day));
          await axios.post('http://localhost:5000/api/requirement/workforce', {
            date: date.toISOString().split('T')[0],
            ...slotData
          }, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        }
      }
      console.log('Data submitted successfully');
    } catch (error) {
      console.error('Failed to submit data:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        {weekDays.map(day => 
          <Day 
            day={day} 
            key={day} 
            slotCounts={slotCounts} 
            setSlotCounts={setSlotCounts}
          />
        )}
      </Box>
      <Button
        variant="outlined"
        color="inherit"
        onClick={submit}
        sx={{
          borderColor: 'white',
          '&.MuiButton-outlined': {
            borderColor: 'white',
          },
          '&:hover': {
            borderColor: 'white',
          },
          '&.MuiButton-text': {
            borderColor: 'white',
            color: 'white',
            backgroundColor: '#2e7c67',
          }
        }}
      >
        Submit
      </Button>

    </Box>
  );
};

export default Week;
