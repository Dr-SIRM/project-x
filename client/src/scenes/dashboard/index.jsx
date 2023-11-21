import React, { useEffect, useState } from 'react';
import { Box, Typography, Select, MenuItem, useTheme, IconButton, useMediaQuery } from "@mui/material";
import { tokens } from "../../theme";
import { mockTransactions } from "../../data/mockData";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../components/Header";
import LineChart from "../../components/LineChart";
import BarChart from "../../components/BarChart";
import StatBox from "../../components/StatBox";
import ProgressCircle from "../../components/ProgressCircle";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import { AuthContext } from "../../AuthContext";
import { API_BASE_URL } from "../../config";
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import '../../i18n';  
import { SiMinutemailer } from "react-icons/si";

/* Mögliche Ideen fürs Dashboard
- Anz gearbeitete Stunden diese Woche 
- Anz MA - done
- Eingeplante Schichten - done
- Wer arbeitet gerade 
- Schichtplan gesolved ja nein für 1 Woche 2 Wochen 3 Wochen 4 Wochen (Recent Transaction)
- Digramm Tage/Stunden/ MA Stunden
- Download button ausblenden - done
*/


const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [mitarbeiterCount, setMitarbeiterCount] = useState();
  const [StartTimeCount, setStartTimeCount] = useState();
  const [upcomingShifts, setUpcomingShifts] = useState([]);
  const [hoursWorkedData, setHoursWorkedData] = useState([]); 
  const [fullTimeWorkers, setFullTimeWorkers] = useState([]);
  const [parttimeData, setPartTimeData] = useState([]); 
  const [currentShifts, setCurrentShifts] = useState([]);
  const [missingUser, setMissingUser] = useState([])
  const [insufficientPlanning, setInsufficientPlanning] = useState([])
  const totalHoursWorked = (hoursWorkedData && Array.isArray(hoursWorkedData)) ? hoursWorkedData.reduce((sum, item) => sum + parseFloat(item.hours_worked), 0) : 0;
  const token = localStorage.getItem('session_token'); 
  const { t, i18n } = useTranslation();
  const [selectedMissingWeek, setSelectedMissingWeek] = useState(1);
  const [currentWeekNum, setCurrentWeekNum] = useState();
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check for mobile view
  
  
  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/dashboard?selectedMissingWeek=${encodeURIComponent(selectedMissingWeek)}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            setPartTimeData(response.data.part_time_count)
            setMitarbeiterCount(response.data.worker_count);
            setStartTimeCount(response.data.start_time_count);
            setFullTimeWorkers(response.data.full_time_count);
            setUpcomingShifts(response.data.upcoming_shifts);  // Store the upcoming shifts data
            setHoursWorkedData(response.data.hours_worked_over_time);
            setCurrentShifts(response.data.current_shifts);
            setMissingUser(response.data.missing_user_list);
            setCurrentWeekNum(response.data.current_week_num);
            setInsufficientPlanning(response.data.unavailable_times);

            console.log(response.data.upcoming_shifts);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    fetchData();
}, [selectedMissingWeek]);

  const handleFormSubmit = async (buttonName) => {

    const payload = { button: buttonName };
    console.log("Final payload before sending to server:", payload);

    try {
      // Send the updated form values to the server for database update
      await axios.post(`${API_BASE_URL}/api/dashboard?selectedMissingWeek=${encodeURIComponent(selectedMissingWeek)}`, payload, {
    headers: {
        'Authorization': `Bearer ${token}`
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error Sending Mail:', error);
      setShowErrorNotification(true);
    }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
      <Header title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />

        <Box>
{/*           <Button
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontSize: "14px",
              fontWeight: "bold",
              padding: "10px 20px",
            }}
          >
            <DownloadOutlinedIcon sx={{ mr: "10px" }} />
            Download Reports
          </Button> */}
        </Box>
      </Box>

      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns={isMobile ? "1fr" : "repeat(12, 1fr)"}
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn={isMobile ? "span 12" : "span 3"}
          backgroundColor={colors.primary[800]}
          borderRadius="15px"  
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={fullTimeWorkers}
            subtitle={t('dashboard.fulltimeworkers')}
            progress="0.75"
            increase="+14%"
            icon={
              <AccountCircleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn={isMobile ? "span 12" : "span 3"}
          backgroundColor={colors.primary[800]}
          borderRadius="15px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={parttimeData}
            subtitle={t('dashboard.partimeworkers')}
            progress="0.50"
            increase="+21%"
            icon={
              <ChangeCircleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn={isMobile ? "span 12" : "span 3"}
          backgroundColor={colors.primary[800]}
          borderRadius="15px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={mitarbeiterCount ? mitarbeiterCount.toString() : 'Loading...'}
            subtitle={t('dashboard.mitarbeiter')}
            progress="0.50"
            increase="+5%"
            icon={
              <PersonAddIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>
        <Box
          gridColumn={isMobile ? "span 12" : "span 3"}
          backgroundColor={colors.primary[800]}
          borderRadius="15px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={StartTimeCount}
            subtitle={t('dashboard.eingeplanteSchichten')}
            progress="0.80"
            increase="+43%"
            icon={
              <TrafficIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn={isMobile ? "span 12" : "span 8"}
          gridRow="span 2"
          backgroundColor={colors.primary[800]}
          borderRadius="15px"
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                {t('dashboard.hoursWorked')}
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {totalHoursWorked} {t('dashboard.hours')}
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} hoursWorkedData={hoursWorkedData} />

          </Box>
        </Box>
        <Box
          gridColumn={isMobile ? "span 12" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[800]}
          borderRadius="15px"
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              {t('dashboard.nextShifts')} 
            </Typography>
          </Box>
          {upcomingShifts.map((shiftInfo, i) => (
            <Box
                key={`${shiftInfo.name}-${i}`}  // Use a unique key for each item
                display="grid"
                gridTemplateColumns="1fr 1fr 1fr"  // Two columns for name, one for day and one for time
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
            >
                <Box>
                    <Typography
                        color={colors.greenAccent[500]}
                        variant="h5"
                        fontWeight="600"
                    >
                        {shiftInfo.name}  
                    </Typography>
                </Box>
                <Box>
                    <Typography color={colors.grey[100]}>
                        {shiftInfo.day} 
                    </Typography>
                </Box>
                {shiftInfo.shifts.map((shift, shiftIndex) => (  // Map over the shifts array
                    <Box key={shiftIndex}>
                        <Typography color={colors.grey[100]}>
                            {shift.start} bis {shift.end}  {/* Display the shift times */}
                        </Typography>
                    </Box>
                ))}
            </Box>
          ))}
        </Box>
        {/* ROW 3 */}
        <Box
          gridColumn={isMobile ? "span 12" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[800]}
          borderRadius="15px"
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              {t('dashboard.missing_availability')} 
            </Typography>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              value={selectedMissingWeek}
              onChange={(e) => setSelectedMissingWeek(e.target.value)}
              style={{ color: colors.grey[100], width: '120px' }}  // Assuming you want the dropdown text to be white
              size="small"
          >
              <MenuItem value={1}>{t('dashboard.calendar_week')} {currentWeekNum}</MenuItem>
              <MenuItem value={2}>{t('dashboard.calendar_week')} {currentWeekNum+1}</MenuItem>
              <MenuItem value={3}>{t('dashboard.calendar_week')} {currentWeekNum+2}</MenuItem>
              <MenuItem value={4}>{t('dashboard.calendar_week')} {currentWeekNum+3}</MenuItem>
            </Select>
            <IconButton 
                    color="inherit" 
                    onClick={() => handleFormSubmit("Msg_Missing_Availability")}
                >
                    <SiMinutemailer />
            </IconButton>
          </Box>
          {missingUser.map((user) => (
            <Box
                key={`${user.name}`}  // Use a unique key for each item
                display="grid"
                gridTemplateColumns="1fr 1fr"  // Two columns for name, one for day and one for time
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
            >
                <Box>
                    <Typography
                        color={colors.greenAccent[500]}
                        variant="h5"
                        fontWeight="600"
                    >
                        {user.name}  
                    </Typography>
                </Box>
                <Box>
                    <Typography color={colors.grey[100]}>
                        {user.email} 
                    </Typography>
                </Box>
              </Box>
              ))}
        </Box>
        <Box
          gridColumn={isMobile ? "span 12" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[800]}
          borderRadius="15px"
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              {t('dashboard.insufficient_planning')} 
            </Typography>
            <Select
              labelId="simple-select-label"
              id="simple-select"
              value={selectedMissingWeek}
              onChange={(e) => setSelectedMissingWeek(e.target.value)}
              style={{ color: colors.grey[100], width: '120px' }}  // Assuming you want the dropdown text to be white
              size="small"
          >
              <MenuItem value={1}>{t('dashboard.calendar_week')} {currentWeekNum}</MenuItem>
              <MenuItem value={2}>{t('dashboard.calendar_week')} {currentWeekNum+1}</MenuItem>
              <MenuItem value={3}>{t('dashboard.calendar_week')} {currentWeekNum+2}</MenuItem>
              <MenuItem value={4}>{t('dashboard.calendar_week')} {currentWeekNum+3}</MenuItem>
          </Select>
          <IconButton 
            color="inherit" 
            onClick={() => handleFormSubmit("Msg_Insufficient_Planning")}
            >
            <SiMinutemailer />
          </IconButton>
          </Box>
          {insufficientPlanning.map((missing_user) => (
            <Box
              key={`${missing_user.date}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box flexGrow={1}>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {missing_user.date}
                </Typography>
              </Box>
              <Box>
                <Typography color={colors.grey[100]}>
                  {missing_user.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          gridColumn={isMobile ? "span 12" : "span 4"}
          gridRow="span 2"
          backgroundColor={colors.primary[800]}
          borderRadius="15px"
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
            {t('dashboard.whosworking')} 
            </Typography>
          </Box>
          {currentShifts.map((shift, i) => (
            <Box
              key={`${shift.name}-${i}`}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              borderBottom={`4px solid ${colors.primary[500]}`}
              p="15px"
            >
              <Box flexGrow={1}>
                <Typography
                  color={colors.greenAccent[500]}
                  variant="h5"
                  fontWeight="600"
                >
                  {shift.name}
                </Typography>
              </Box>
              <Box>
                <Typography color={colors.grey[100]}>
                  {shift.start} bis {shift.end}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>

      </Box>
    </Box>
  );
};

export default Dashboard;
