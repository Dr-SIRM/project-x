import React, { useState } from 'react';
import { Box, Typography, TextField, ButtonGroup, Button } from '@mui/material';

// 24 hours * 4 slots/hour = 96 slots
const slots = Array.from({ length: 96 }, (_, i) => ({
  id: i,
  time: `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
}));

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const Day = ({ day }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);

  const selectSlot = (slot) => {
    setSelectedSlots(prevSlots => [...prevSlots, slot]);
  };

  const setEmployees = (event) => {
    setEmployeeCount(event.target.value);
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
      <ButtonGroup orientation="vertical" fullWidth>
        {slots.map(slot => 
          <Button 
            variant={selectedSlots.includes(slot.id) ? 'contained' : 'outlined'}
            color={selectedSlots.includes(slot.id) ? 'success' : 'inherit'}
            onClick={() => selectSlot(slot.id)}
            key={slot.id}
          >
            {slot.time}
          </Button>
        )}
      </ButtonGroup>
    </Box>
  );
};

const Week = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', overflowX: 'auto' }}>
      {weekDays.map(day => <Day day={day} key={day} />)}
    </Box>
  );
};

export default Week;
