import React, { useEffect, useState } from "react";
import axios from 'axios';
import { formatDate } from "@fullcalendar/core";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { API_BASE_URL } from "../../config";
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
          const response = await axios.get(`${API_BASE_URL}/api/calendar`, {
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

      <style>{`
        .fc-toolbar-title { 
          color: black !important;
        }
        .fc-button { 
          color: white !important; 
          background-color: black !important;
        }
        .fc-timegrid-slot-label,
        .fc-col-header-cell { 
          color: black !important; 
        }
        .fc-timegrid-axis-cushion.fc-scrollgrid-shrink-cushion.fc-scrollgrid-sync-inner {
          color: black !important;
        }
      `}</style>
  
      {/* Button to export events */}
      <Box mb="10px">
        <Button variant="outlined"
                color="inherit"
                size="small"
                onClick={downloadICS} 
                sx={{
                  borderColor: 'black',
                  height: '20px',
                  minHeight: '20px',
                  fontSize: '10px',
                  '&.MuiButtonOutlined': {
                    borderColor: 'white',
                  },
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: "#97dbc9",
                  },
                  '&.MuiButtonText': {
                    borderColor: 'white',
                    color: 'white',
                    backgroundColor: '#2e7c67',
                  }
                }}>Export Kalender    
                  <Box ml="5px" mt="5px"><svg xmlns="http://www.w3.org/2000/svg"  x="0px" y="0px" width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#103262" d="M43.255,23.547l-6.81-3.967v11.594H44v-6.331C44,24.309,43.716,23.816,43.255,23.547z"></path><path fill="#0084d7" d="M13,10h10v9H13V10z"></path><path fill="#33afec" d="M23,10h10v9H23V10z"></path><path fill="#54daff" d="M33,10h10v9H33V10z"></path><path fill="#027ad4" d="M23,19h10v9H23V19z"></path><path fill="#0553a4" d="M23,28h10v9H23V28z"></path><path fill="#25a2e5" d="M33,19h10v9H33V19z"></path><path fill="#0262b8" d="M33,28h10v9H33V28z"></path><polygon points="13,37 43,37 43,24.238 28.99,32.238 13,24.238" opacity=".019"></polygon><polygon points="13,37 43,37 43,24.476 28.99,32.476 13,24.476" opacity=".038"></polygon><polygon points="13,37 43,37 43,24.714 28.99,32.714 13,24.714" opacity=".057"></polygon><polygon points="13,37 43,37 43,24.952 28.99,32.952 13,24.952" opacity=".076"></polygon><polygon points="13,37 43,37 43,25.19 28.99,33.19 13,25.19" opacity=".095"></polygon><polygon points="13,37 43,37 43,25.429 28.99,33.429 13,25.429" opacity=".114"></polygon><polygon points="13,37 43,37 43,25.667 28.99,33.667 13,25.667" opacity=".133"></polygon><polygon points="13,37 43,37 43,25.905 28.99,33.905 13,25.905" opacity=".152"></polygon><polygon points="13,37 43,37 43,26.143 28.99,34.143 13,26.143" opacity=".171"></polygon><polygon points="13,37 43,37 43,26.381 28.99,34.381 13,26.381" opacity=".191"></polygon><polygon points="13,37 43,37 43,26.619 28.99,34.619 13,26.619" opacity=".209"></polygon><polygon points="13,37 43,37 43,26.857 28.99,34.857 13,26.857" opacity=".229"></polygon><polygon points="13,37 43,37 43,27.095 28.99,35.095 13,27.095" opacity=".248"></polygon><polygon points="13,37 43,37 43,27.333 28.99,35.333 13,27.333" opacity=".267"></polygon><polygon points="13,37 43,37 43,27.571 28.99,35.571 13,27.571" opacity=".286"></polygon><polygon points="13,37 43,37 43,27.81 28.99,35.81 13,27.81" opacity=".305"></polygon><polygon points="13,37 43,37 43,28.048 28.99,36.048 13,28.048" opacity=".324"></polygon><polygon points="13,37 43,37 43,28.286 28.99,36.286 13,28.286" opacity=".343"></polygon><polygon points="13,37 43,37 43,28.524 28.99,36.524 13,28.524" opacity=".362"></polygon><polygon points="13,37 43,37 43,28.762 28.99,36.762 13,28.762" opacity=".381"></polygon><polygon points="13,37 43,37 43,29 28.99,37 13,29" opacity=".4"></polygon><linearGradient id="Qf7015RosYe_HpjKeG0QTa_ut6gQeo5pNqf_gr1" x1="38.925" x2="32.286" y1="24.557" y2="36.024" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#31abec"></stop><stop offset="1" stop-color="#1582d5"></stop></linearGradient><path fill="url(#Qf7015RosYe_HpjKeG0QTa_ut6gQeo5pNqf_gr1)" d="M15.441,42h26.563c1.104,0,1.999-0.889,2-1.994C44.007,35.485,44,24.843,44,24.843	s-0.007,0.222-1.751,1.212S14.744,41.566,14.744,41.566S14.978,42,15.441,42z"></path><linearGradient id="Qf7015RosYe_HpjKeG0QTb_ut6gQeo5pNqf_gr2" x1="13.665" x2="41.285" y1="6.992" y2="9.074" gradientUnits="userSpaceOnUse"><stop offset=".042" stop-color="#076db4"></stop><stop offset=".85" stop-color="#0461af"></stop></linearGradient><path fill="url(#Qf7015RosYe_HpjKeG0QTb_ut6gQeo5pNqf_gr2)" d="M43,10H13V8c0-1.105,0.895-2,2-2h26c1.105,0,2,0.895,2,2V10z"></path><linearGradient id="Qf7015RosYe_HpjKeG0QTc_ut6gQeo5pNqf_gr3" x1="28.153" x2="23.638" y1="33.218" y2="41.1" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#33acee"></stop><stop offset="1" stop-color="#1b8edf"></stop></linearGradient><path fill="url(#Qf7015RosYe_HpjKeG0QTc_ut6gQeo5pNqf_gr3)" d="M13,25v15c0,1.105,0.895,2,2,2h15h12.004c0.462,0,0.883-0.162,1.221-0.425L13,25z"></path><path d="M21.319,13H13v24h8.319C23.352,37,25,35.352,25,33.319V16.681C25,14.648,23.352,13,21.319,13z" opacity=".05"></path><path d="M21.213,36H13V13.333h8.213c1.724,0,3.121,1.397,3.121,3.121v16.425	C24.333,34.603,22.936,36,21.213,36z" opacity=".07"></path><path d="M21.106,35H13V13.667h8.106c1.414,0,2.56,1.146,2.56,2.56V32.44C23.667,33.854,22.52,35,21.106,35z" opacity=".09"></path><linearGradient id="Qf7015RosYe_HpjKeG0QTd_ut6gQeo5pNqf_gr4" x1="3.53" x2="22.41" y1="14.53" y2="33.41" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#1784d8"></stop><stop offset="1" stop-color="#0864c5"></stop></linearGradient><path fill="url(#Qf7015RosYe_HpjKeG0QTd_ut6gQeo5pNqf_gr4)" d="M21,34H5c-1.105,0-2-0.895-2-2V16c0-1.105,0.895-2,2-2h16c1.105,0,2,0.895,2,2v16	C23,33.105,22.105,34,21,34z"></path><path fill="#fff" d="M13,18.691c-3.111,0-4.985,2.377-4.985,5.309S9.882,29.309,13,29.309	c3.119,0,4.985-2.377,4.985-5.308C17.985,21.068,16.111,18.691,13,18.691z M13,27.517c-1.765,0-2.82-1.574-2.82-3.516	s1.06-3.516,2.82-3.516s2.821,1.575,2.821,3.516S14.764,27.517,13,27.517z"></path>
                  </svg></Box>
                </Button>
      </Box>
  
      <Box display="flex" justifyContent="space-between">
        {/* Calendar Sidebar */}
        <Box
          flex="1 1 20%"
          backgroundColor={colors.primary[100]}
          p="15px"
          borderRadius="4px"
          style={{ maxHeight: 'calc(8 * 60px + 10px)', overflowY: 'auto' }}
        >
          <Typography variant="h5" color={"white"}>Events</Typography>
          <List>
            {currentEvents.map((event) => (
              <ListItem
                key={event.id}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  borderColor: colors.grey[900],
                  margin: "10px 0",
                  borderRadius: "2px",
                  color: "white"
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
  
        {/* Full Calendar */}
        <Box flex="1 1 100%" ml="15px">
          <FullCalendar
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            timeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            dayHeaderContent={({date}) => {
              const day = date.getUTCDate();
              const month = date.getUTCMonth() + 1;
              const dayOfWeek = date.toLocaleString('default', { weekday: 'short' });
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
              backgroundColor: "black",
              borderColor: "black",
              textColor: "white"
            }))}
          />
        </Box>
      </Box>
    </Box>
  );
          }  

export default Calendar;
