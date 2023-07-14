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
      // Check if slot is already selected
      if (prevSlots.includes(slot)) {
        // If it is, remove it from the array
        return prevSlots.filter(s => s !== slot);
      } else {
        // If it isn't, add it to the array
        return [...prevSlots, slot];
      }
    });
  };

  const setEmployees = (event) => {
    setEmployeeCount(event.target.value);
  };

  const enter = () => {
    selectedSlots.forEach(slot => {
      setSlotCounts(prevCounts => ({ ...prevCounts, [slot]: employeeCount }));
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
      />
      <Button variant="contained" color="primary" onClick={enter}>Enter</Button>
      <Box sx={{ overflowY: 'auto', maxHeight: '450px' }}>
      <ButtonGroup orientation="vertical" fullWidth>
        {slots.map(slot => 
          <Button 
            variant={selectedSlots.includes(slot.id) ? 'contained' : 'outlined'}
            color={selectedSlots.includes(slot.id) ? 'success' : 'inherit'}
            onClick={() => selectSlot(slot.id)}
            key={slot.id}
          >
            {slot.time}
            {slotCounts[slot.id] && <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{slotCounts[slot.id]}</span>}
          </Button>
        )}
      </ButtonGroup>
      </Box>
    </Box>
  );
};

const Week = () => {
  const [slotCounts, setSlotCounts] = useState({});

  const submit = async () => {
    try {
      await axios.post('http://localhost:5000/api/requirement/workforce', slotCounts);
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
      <Button onClick={submit} variant="contained" color="primary" sx={{ m: 1 }}>
        Submit
      </Button>
    </Box>
  );
};


export default Week;
