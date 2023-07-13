import React, { useState } from 'react';

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
    <div style={{ margin: '1em' }}>
      <h2>{day}</h2>
      <input type="number" value={employeeCount} onChange={setEmployees} placeholder="Enter employee count..." />
      {slots.map(slot => 
        <div 
          style={{ padding: '0.5em', backgroundColor: selectedSlots.includes(slot.id) ? 'green' : 'white' }}
          onClick={() => selectSlot(slot.id)}
          key={slot.id}
        >
          {slot.time}
        </div>
      )}
    </div>
  );
};

const Week = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', overflowX: 'auto' }}>
      {weekDays.map(day => <Day day={day} key={day} />)}
    </div>
  );
};

export default Week;