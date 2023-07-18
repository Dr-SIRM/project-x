import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, ButtonGroup, Button } from '@mui/material';
import axios from 'axios';

// 24 hours * 4 slots/hour = 96 slots
const slots = Array.from({ length: 96 }, (_, i) => ({
  id: i,
  time: `${String(Math.floor(i / 4)).padStart(2, '0')}:${String((i % 4) * 15).padStart(2, '0')}`,
}));

const Day = ({ day, slotCounts = {}, setSlotCounts, openingHour, closingHour }) => {
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);



  const [startHour, startMinute] = openingHour ? openingHour.split(':') : [0, 0];
  const [endHour, endMinute] = closingHour ? closingHour.split(':') : [0, 0];
  
  let startSlotIndex = parseInt(startHour) * 4 + parseInt(startMinute) / 15;
  let endSlotIndex = parseInt(endHour) * 4 + parseInt(endMinute) / 15;

  const filteredSlots = slots.filter((_, index) => index >= startSlotIndex && index < endSlotIndex);

  const selectSlot = (filteredSlots, e) => {
    if (e.type === 'mousedown') {
      setIsDragging(true);
    }
    
    if (isDragging || e.type === 'mouseup') {
      setSelectedSlots(prevSlots => {
        // Check if slot is already selected
        if (prevSlots.includes(filteredSlots)) {
          // If it is, remove it from the array
          return prevSlots.filter(s => s !== filteredSlots);
        } else {
          // If it isn't, add it to the array
          return [...prevSlots, filteredSlots];
        }
      });
    }

    if (e.type === 'mouseup') {
      setIsDragging(false);
    }
  };

  const setEmployees = (event) => {
    setEmployeeCount(event.target.value);
  };

  const enter = () => {
    selectedSlots.forEach(filteredSlots => {
      setSlotCounts(prevCounts => ({ ...prevCounts, [day]: { ...prevCounts[day], [filteredSlots]: employeeCount } }));
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
      <Button 
        variant="contained" 
        color="primary" 
        onClick={enter} 
        sx={{ 
          p: 0.2, // Add padding
          m: 1,
          borderColor: 'white', // Border color
          borderWidth: 0.05, // Border width
          borderStyle: 'solid', // Border style
          backgroundColor: '#2e7c67', // Background color
          color: 'white', // Text color
          '&:hover': { 
            backgroundColor: 'darkpurple', // Hover background color
          },
        }}
      >
        Enter
      </Button>
      <Box sx={{ overflowY: 'auto', maxHeight: '450px' }}>
      <ButtonGroup orientation="vertical" fullWidth>
        {filteredSlots.map(filteredSlots => {
          const isSelected = selectedSlots.includes(filteredSlots.id);
          const isEntered = slotCounts[day] && slotCounts[day][filteredSlots.id];
          return (
            <Button 
              onMouseDown={(e) => selectSlot(filteredSlots.id, e)}
              onMouseUp={(e) => selectSlot(filteredSlots.id, e)}
              onMouseOver={(e) => selectSlot(filteredSlots.id, e)}
              variant={isEntered ? 'text' : (isSelected ? 'contained' : 'outlined')}
              color={isEntered ? 'error' : (isSelected ? 'success' : 'inherit')}
              key={filteredSlots.id}
              sx={{
                borderColor: 'white', 
                '&.MuiButton-outlined': {
                  borderColor: 'white',
                },
                '&:hover': {
                  borderColor: 'white',
                },
                '&.MuiButton-text': {
                  borderColor: 'white', // add border color to text buttons
                  color: 'white', // change text color
                  backgroundColor: '#2e7c67', // change background color
                }
              }}
            >
              {filteredSlots.time}
              {isEntered && <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{slotCounts[day][filteredSlots.id]}</span>}
            </Button>
          );
        })}
      </ButtonGroup>
      </Box>
    </Box>
  );
};

const Week = () => {
  const [weekDays, setWeekDays] = useState([]); 
  const [slotCounts, setSlotCounts] = useState({});
  const [calendarData, setcalendarData] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [openingHours, setOpeningHours] = useState([]);
  const [closingHours, setClosingHours] = useState([]);
  const token = localStorage.getItem('session_token'); // Get the session token from local storage
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCalendar = async (values) => {
        try {
          const response = await axios.get('http://localhost:5000/api/requirement/workforce', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setcalendarData(response.data);
          const fetchedData = response.data;

          if (fetchedData.weekdays) {
            setWeekDays(Object.values(fetchedData.weekdays));
          }

          const openingHours = [];
          const closingHours = [];
          for (let i = 0; i < fetchedData.day_num; i++) {
            openingHours.push(fetchedData.opening_dict[`${i+1}&0`]);
            closingHours.push(fetchedData.opening_dict[`${i+1}&1`]);
          }
          setOpeningHours(openingHours);
          setClosingHours(closingHours);
          console.log("Opening hours:", openingHours);
          console.log("Closing hours:", closingHours);


        } catch (error) {
          console.error('Error fetching company details:', error);
        }
    };

    fetchCalendar();
  }, []);
  


    const submit = async (values) => {
      const formattedCounts = Object.keys(slotCounts).reduce((formatted, day) => {
        const dayCounts = slotCounts[day];
        const formattedDayCounts = Object.keys(dayCounts).reduce((formattedDay, slotId) => {
          const dayIndex = weekDays.indexOf(day);
          const formattedKey = `worker_${dayIndex}_${slots[slotId].time}`;
          return {
            ...formattedDay,
            [formattedKey]: dayCounts[slotId],
          };
        }, {});
    
        return {
          ...formatted,
          ...formattedDayCounts,
        };
      }, {});

      console.log("Sending POST request with data:", formattedCounts);  // print data to be sent in the console

      try {
        // Send the updated form values to the server for database update
        await axios.post('http://localhost:5000/api/requirement/workforce', formattedCounts, {
      headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          }
      });
        setShowSuccessNotification(true);
        console.log(formattedCounts);
      } catch (error) {
        console.error('Error updating company details:', error);
        console.log("Values to be sent:", formattedCounts);
        if (!formattedCounts) {
          console.error("Values are undefined");
      } else {
          console.log("Values are:", formattedCounts);
      }
      console.log("Stringified values to be sent:", JSON.stringify(formattedCounts));
        setShowErrorNotification(true);
      }
    };

  

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'auto' }}>
      <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
        {weekDays.map((day, index) => 
          <Day 
            day={day} 
            key={day} 
            slotCounts={slotCounts} 
            setSlotCounts={setSlotCounts}
            openingHour={openingHours[index]}
            closingHour={closingHours[index]}
          />
        )}
      </Box>
      <Button onClick={() => submit()} variant="contained" color="primary" sx={{ m: 1 }}>
        Submit
      </Button>
    </Box>
  );
};

export default Week;
