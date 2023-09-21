import React, { useEffect, useState } from "react";
import axios from 'axios';
import { formatDate } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
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
import { tokens } from "../../theme";

const Calendar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [currentEvents, setCurrentEvents] = useState([]);
  const token = localStorage.getItem('session_token');

  useEffect(() => {
    const fetchCalendar = async () => {

        try {
          const response = await axios.get('http://localhost:5000/api/calendar', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setCurrentEvents(response.data);
          console.log(response.data)
        } catch (error) {
          console.error('Error fetching calendar details:', error);

        }
    };

    fetchCalendar();
  }, []);

  // iCalendar helper function
  function eventsToICS(events) {
    let icsEvents = events.map(event => {
      return `BEGIN:VEVENT\r\nDTSTART:${event.start.replace(/[-:]/g, '')}\r\nDTEND:${event.end.replace(/[-:]/g, '')}\r\nSUMMARY:${event.title}\r\nEND:VEVENT`;
    }).join('\r\n');

    return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\n${icsEvents}\r\nEND:VCALENDAR`;
  }

  // Function to initiate download
  function downloadICS() {
    let icsData = eventsToICS(currentEvents);
    let blob = new Blob([icsData], { type: 'text/calendar' });
    let url = window.URL.createObjectURL(blob);

    let a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'events.ics';

    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url);
  }

  const handleDateClick = (selected) => {
    const title = prompt("Please enter a new title for your event");
    const calendarApi = selected.view.calendar;
    calendarApi.unselect();

    if (title) {
      calendarApi.addEvent({
        id: `${selected.dateStr}-${title}`,
        title,
        start: selected.startStr,
        end: selected.endStr,
        allDay: selected.allDay,
      });
    }
  };


  return (
    <Box m="20px">
      <Header title="Calendar" subtitle="Full Calendar Interactive Page" />
      {/* Adding the export button */}
      <Box mb="10px">
        <Button variant="outlined"
                color="inherit"
                size="small"
                onClick={downloadICS} 
                sx={{
                  borderColor: 'white',
                  height: '20px',
                  minHeight: '20px',
                  fontSize: '10px',
                  '&.MuiButtonOutlined': {
                    borderColor: 'white',
                  },
                  '&:hover': {
                    borderColor: 'white',
                  },
                  '&.MuiButtonText': {
                    borderColor: 'white',
                    color: 'white',
                    backgroundColor: '#2e7c67',
                  }
                }}>Export zum Kalender</Button>
      </Box>

      <Box display="flex" justifyContent="space-between">
        {/* CALENDAR SIDEBAR */}
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[400]}
          p="15px"
          borderRadius="4px"
          style={{ maxHeight: 'calc(8 * 60px + 10px)', overflowY: 'auto' }}  // Added these styles
        >
          <Typography variant="h5">Events</Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  margin: "10px 0",
                  borderRadius: "2px",
                }}
              >
                <ListItemText
                  primary={event.title}
                  secondary={
                    <Typography>
                      {formatDate(event.start, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
        {/* CALENDAR */}
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            timeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            dayHeaderContent={({date}) => {
              const day = date.getUTCDate();  // gets the day of the month
              const month = date.getUTCMonth() + 1;  // gets the month (0-11, so we add 1)
              const dayOfWeek = date.toLocaleString('default', { weekday: 'short' }); // gets the abbreviated day of the week
              return `${dayOfWeek} ${day}.${month < 10 ? '0' + month : month}`;
          }}
            height="75vh"
            plugins={[
              dayGridPlugin,
              timeGridPlugin,
              interactionPlugin,
              listPlugin,
            ]}
            
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay,listMonth",
            }}
            initialView="timeGridWeek"
            editable={false}
            selectable={false}
            selectMirror={false}
            dayMaxEvents={false}
            select={handleDateClick}
                
            
            events={currentEvents.map(event => ({
              ...event,
              backgroundColor: "grey",  
              borderColor: "black",
              textColor: "white"
          }))}
          
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Calendar;
