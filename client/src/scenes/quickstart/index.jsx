import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { useState, useEffect } from "react";
import { Box, Button, TextField, useTheme, Snackbar, Typography, Select, MenuItem, ToggleButtonGroup, ToggleButton } from "@mui/material";
import axios from 'axios';
import { API_BASE_URL } from "../../config";
import { Formik } from "formik";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTranslation } from 'react-i18next';
import Header from "../../components/Header";
import { tokens } from "../../theme";

const QuickStartPopup = ({ open, onClose }) => {
    const token = localStorage.getItem('session_token');
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false);
    const [isChecked, setIsChecked] = useState(false);
    const [initialData, setInitialData] = useState({});
    const [isLoading, setIsLoading] = useState(true); 
    const isNonMobile = useMediaQuery("(min-width:600px)");
    const { t, i18n } = useTranslation();
    const [currentStep, setCurrentStep] = useState(1);
    const [weekdays, setWeekdays] = useState([]);
    const [formData, setFormData] = useState({
        weekly_hours: '',
        department: '',
        department2: '',
        department3: '',
        shifts: '',
        day_0_0: '',
        day_0_1: '',
        day_0_2: '',
        day_0_3: '',
        day_1_0: '',
        day_1_1: '',
        day_1_2: '',
        day_1_3: '',
        day_2_0: '',
        day_2_1: '',
        day_2_2: '',
        day_2_3: '',
        day_3_0: '',
        day_3_1: '',
        day_3_2: '',
        day_3_3: '',
        day_4_0: '',
        day_4_1: '',
        day_4_2: '',
        day_4_3: '',
        day_5_0: '',
        day_5_1: '',
        day_5_2: '',
        day_5_3: '',
        day_6_0: '',
        day_6_1: '',
        day_6_2: '',
        day_6_3: '',
        desired_min_time_day: '',
        min_time_day: '',
        desired_max_time_day: '',
        max_time_day: '',
        max_time_week: '',
        fair_distribution: '',
        hour_divider: '',
        week_timeframe: '',
        subsequent_workingdays: '',
        daily_deployment: '',
        time_per_deployment: '',
        nb1: '',
        nb2: '',
        nb3: '',
        nb4: '',
        nb5: '',
        nb6: '',
        nb7: '',
        nb8: '',
        nb9: '',
        nb10: '',
        nb11: '',
        nb12: '',
        // ... other fields
    });


    useEffect(() => {
        const initialWeekdays = {
            0: 'Montag',
            1: 'Dienstag',
            2: 'Mittwoch',
            3: 'Donnerstag',
            4: 'Freitag',
            5: 'Samstag',
            6: 'Sonntag'
        };
        setWeekdays(Object.values(initialWeekdays));
    }, []);

    const handleNext = () => {
        // Validate current step's data before proceeding
        // Update the current step
        setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        // Logic to go back to the previous step
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (values) => {
    
        Object.keys(values).forEach((key) => {
          if (values[key] === '' || values[key] === undefined) {
            values[key] = undefined;
          }
        });
    
        try {
          // Send the updated form values to the server for database update
          await axios.post(`${API_BASE_URL}/api/check_initial_setup`, formData, {
        headers: {
            'Authorization': `Bearer ${token}`
            }
        });
          setShowSuccessNotification(true);
          console.log("Sending this data to server:", formData);
          onClose();
        } catch (error) {
          console.error('Error updating details:', error);
          setShowErrorNotification(true);
        }
      };

      
  return (
    <Popup open={open} closeOnDocumentClick={false} onClose={onClose}>
        <Box>
        {currentStep === 1 && (
            <>
            <Header
            title={t('company.title')}
            />
            <Typography variant="h4" paddingBottom={"10px"}>{t('company.companyinfo')}</Typography>
            <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(6, minmax(0, 1fr))"
                sx={{
                    "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
                }}
                >
                <Typography
                    variant="h6"
                    sx={{
                    gridColumn: "span 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // Center the text horizontally
                    height: "100%",
                    padding: "0 8px", // Add padding to the sides of the text
                    backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
                    }}
                >
                    {t('company.weekhours')}
                </Typography>
                <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label= ""
                    name="weekly_hours"
                    value={formData.weekly_hours}
                    onChange={handleInputChange}
                    sx={{
                    gridColumn: "span 1",
                    '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    },
                    }}
                />
                <Typography
                    variant="h6"
                    sx={{
                    gridColumn: "span 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // Center the text horizontally
                    height: "100%",
                    padding: "0 8px", // Add padding to the sides of the text
                    backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
                    }}
                >
                    {t('company.departement1')}
                </Typography>
                <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label= ""
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    sx={{
                    gridColumn: "span 1",
                    '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    },
                    }}
                />
                <Typography
                    variant=""
                    sx={{
                    gridColumn: "span 2",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                    }}
                ></Typography>

                <Typography
                    variant="h6"
                    sx={{
                    gridColumn: "span 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // Center the text horizontally
                    height: "100%",
                    padding: "0 8px",
                    backgroundColor: "#f0f0f0", 
                    }}
                >
                    {t('company.shifts')}
                </Typography>
                <Select
                    fullWidth
                    variant="filled"
                    type="text"
                    label= ""
                    name="shifts"
                    value={formData.shifts}
                    onChange={handleInputChange}
                    sx={{
                    gridColumn: "span 1",
                    '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    },
                    '& .MuiSelect-icon': { 
                        color: 'black', 
                    },
                    }}
                    >
                    <MenuItem value={ '1' }>1</MenuItem>
                    <MenuItem value={ '2' }>2</MenuItem>
                    <MenuItem value={ '3' }>3</MenuItem>
                </Select>
                
                <Typography
                    variant="h6"
                    sx={{
                    gridColumn: "span 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // Center the text horizontally
                    height: "100%",
                    padding: "0 8px", // Add padding to the sides of the text
                    backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
                    }}
                >
                    {t('company.departement2')}
                </Typography>
                <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label= ""
                    name="department2"
                    value={formData.department2}
                    onChange={handleInputChange}
                    sx={{
                    gridColumn: "span 1",
                    '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    },
                    }}
                />
                <Typography
                    variant=""
                    sx={{
                    gridColumn: "span 2",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                    }}
                ></Typography>
                <Typography
                    variant="h6"
                    sx={{
                    gridColumn: "span 2",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // Center the text horizontally
                    height: "100%",
                    padding: "0 8px", // Add padding to the sides of the text
                    }}
                >
                </Typography>
                
                <Typography
                    variant="h6"
                    sx={{
                    gridColumn: "span 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // Center the text horizontally
                    height: "100%",
                    padding: "0 8px", // Add padding to the sides of the text
                    backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
                    }}
                >
                    {t('company.departement3')}
                </Typography>
                <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label= ""
                    name="department3"
                    value={formData.department3}
                    onChange={handleInputChange}
                    sx={{
                    gridColumn: "span 1",
                    '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                    },
                    }}
                />
                <Typography
                    variant=""
                    sx={{
                    gridColumn: "span 2",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                    }}
                ></Typography>
            </Box>   
            </>
        )}  
        {currentStep === 2 && (
            <>
            <Header
            title={t('company.openinghours')}
            />
            <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(6, minmax(0, 1fr))"
                sx={{
                    "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
                }}
                >
                <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                  justifyContent: "center",
                }}
              >
                {t('company.weekday')}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {t('company.startime1')}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {t('company.endtime1')}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {t('company.startime2')}
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              >
                {t('company.endtime2')}
              </Typography>

              <Typography
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              {Array.from({ length: 7 }).map((_, rowIndex) => (
              <>
                <Typography
                  key={`number-${rowIndex}`}
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center", // Center the text horizontally
                    height: "100%",
                    padding: "0 8px", // Add padding to the sides of the text
                    backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
                  }}
                >
                  {weekdays[rowIndex]}
                  </Typography>
                  <TextField
                    key={`day_${rowIndex}_0`}
                    fullWidth
                    variant="filled"
                    type="time"
                    name={`day_${rowIndex}_0`}
                    value={formData[`day_${rowIndex}_0`]}
                    onChange={handleInputChange}

                    sx={{
                      gridColumn: "span 1",
                      '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      },
                    }}
                  />
                  <TextField
                    key={`day_${rowIndex}_1`}
                    fullWidth
                    variant="filled"
                    type="time"
                    name={`day_${rowIndex}_1`}
                    value={formData[`day_${rowIndex}_1`]}
                    onChange={handleInputChange}
                    sx={{
                      gridColumn: "span 1",
                      '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      },
                    }}
                  />
                  <TextField
                    key={`day_${rowIndex}_2`}
                    fullWidth
                    variant="filled"
                    type="time"
                    name={`day_${rowIndex}_2`}
                    value={formData[`day_${rowIndex}_2`]}
                    onChange={handleInputChange}
                    sx={{
                      gridColumn: "span 1",
                      '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      },
                    }}
                  />
                  <TextField
                    key={`day_${rowIndex}_3`}
                    fullWidth
                    variant="filled"
                    type="time"
                    name={`day_${rowIndex}_3`}
                    value={formData[`day_${rowIndex}_3`]}
                    onChange={handleInputChange}
                    sx={{
                      gridColumn: "span 1",
                      '& .MuiFilledInput-input': {
                        paddingTop: '10px',
                        paddingBottom: '10px',
                      },
                    }}
                  />
                  <Typography
                    key={`empty-1-${rowIndex}`}
                    variant=""
                    sx={{
                      gridColumn: "span 1",
                      display: "flex",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  
                </>
              ))}
            </Box>
            </>
        )}
        {currentStep === 3 && (
            <>
            <Header
            title={t('solverreq.Mindestanforderungen')}
            />
            <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(6, minmax(0, 1fr))"
                sx={{
                    "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
                }}
                >
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                  {t('solverreq.wishedminworkinghoursperday')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                name="desired_min_time_day"
                value={formData.desired_min_time_day}
                onChange={handleInputChange}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '150px',
                  '& .MuiFilledInput-input': {
                    paddingTop: '0px',
                    paddingBottom: '2px',
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
                />
                <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 3",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                  {t('solverreq.mintimeperday')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                name="min_time_day"
                value={formData.min_time_day}
                onChange={handleInputChange}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '150px',
                  '& .MuiFilledInput-input': {
                    paddingTop: '0px',
                    paddingBottom: '2px',
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
                />
                <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 3",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                 {t('solverreq.wishedmaxworkinghoutperday')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                name="desired_max_time_day"
                value={formData.desired_max_time_day}
                onChange={handleInputChange}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '150px',
                  '& .MuiFilledInput-input': {
                    paddingTop: '0px',
                    paddingBottom: '2px',
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
                />
                <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 3",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                  {t('solverreq.maxworktimeperday')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                name="max_time_day"
                value={formData.max_time_day}
                onChange={handleInputChange}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '150px',
                  '& .MuiFilledInput-input': {
                    paddingTop: '0px',
                    paddingBottom: '2px',
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
                />
                <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 3",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                  {t('solverreq.maxtimeperweek')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                name="max_time_week"
                value={formData.max_time_week}
                onChange={handleInputChange}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '150px',
                  '& .MuiFilledInput-input': {
                    paddingTop: '0px',
                    paddingBottom: '2px',
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
                />
                <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 3",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                 {t('solverreq.differencetodistribution')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                name="fair_distribution"
                value={formData.fair_distribution}
                onChange={handleInputChange}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '150px',
                  '& .MuiFilledInput-input': {
                    paddingTop: '0px',
                    paddingBottom: '2px',
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
                />
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                  {t('solverreq.hourunit')}
                </Typography>
                <Select
                  labelId="hour_divider-label"
                  id="hour_divider"
                  name="hour_divider"
                  value={formData.hour_divider}
                  onChange={handleInputChange}

                  sx={{
                    gridColumn: "span 1",
                    '& .MuiFilledInput-input': {
                      paddingTop: '0px',
                      paddingBottom: '0px',
                    },
                    
                  }}
                >
                  <MenuItem value="1">1</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="4">4</MenuItem>
                </Select>
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                  {t('solverreq.calculationtimeframe')}
                </Typography>
                <Select
                  labelId="week_timeframe-label"
                  id="week_timeframe"
                  name="week_timeframe"
                  value={formData.week_timeframe}
                  onChange={handleInputChange}

                  sx={{
                    gridColumn: "span 1",
                    '& .MuiFilledInput-input': {
                      paddingTop: '10px',
                      paddingBottom: '10px',
                    },
                    '& .MuiSelect-icon': { 
                      color: 'black', 
                    },
                  }}
                >
                  <MenuItem value="1">1</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="4">4</MenuItem>
                </Select>
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                  {t('solverreq.maxworkingdayinarow')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                name="subsequent_workingdays"
                value={formData.subsequent_workingdays}
                onChange={handleInputChange}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '150px',
                  '& .MuiFilledInput-input': {
                    paddingTop: '0px',
                    paddingBottom: '2px',
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
                />
                <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 2",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                  {t('solverreq.countofshiftsperday')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                name="daily_deployment"
                value={formData.daily_deployment}
                onChange={handleInputChange}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '150px',
                  '& .MuiFilledInput-input': {
                    paddingTop: '0px',
                    paddingBottom: '2px',
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
                />
                <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 3",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  justifyContent: "left",
                  height: "100%",
                  backgroundColor: "#f0f0f0", 
                }}
                >
                  {t('solverreq.minhoursperworkingshift')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                name="time_per_deployment"
                value={formData.time_per_deployment}
                onChange={handleInputChange}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '150px',
                  '& .MuiFilledInput-input': {
                    paddingTop: '0px',
                    paddingBottom: '2px',
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                  },
                }}
                />
                <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 3",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
            </Box>   
            </>
        )}  
        {currentStep === 4 && (
            <>
                <Header
                title={t('company.title')}
                />
                <Box
                    display="grid"
                    gap="30px"
                    gridTemplateColumns="repeat(6, minmax(0, 1fr))"
                    sx={{
                        "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
                    }}
                    >
                    <Typography
                        color={colors.primary[100]}
                        variant=""
                        sx={{
                            gridColumn: "span 2",
                            display: "grid",
                            alignItems: "center",
                            height: "100%",
                        }}
                        ></Typography>
                        <Typography
                        color={colors.primary[100]}
                        variant=""
                        sx={{
                        gridColumn: "span 2",
                        display: "grid",
                        alignItems: "right",
                        textAlign: "right",
                        height: "100%",
                        }}
                    >
                        Ja, ist mir egal
                    </Typography>
                    <Typography
                        color={colors.primary[100]}
                        variant=""
                        sx={{
                        gridColumn: "span 2",
                        display: "grid",
                        alignItems: "right",
                        textAlign: "right",
                        height: "100%",
                        }}
                    >
                        Nein lieber nicht
                    </Typography>

                    {/* New Line */}
                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Dürfen mehr Mitarbeiter pro Zeiteinheit eingeplant werden als nötig?
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb1}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                        target: { value: newValue, name: 'nb1' }
                        })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    {/* New Line */}

                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Darf die maximale Arbietszeit pro Woche überschritten werden?
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb2}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb2' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                        {/* New Line */}

                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Darf die minimale Arbeitzeit pro Tag unterschritten werden?
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb3}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb3' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                        {/* New Line */}

                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Darf die maximale Arbeitzeit pro Tag überschritten werden?
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb4}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb4' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                        {/* New Line */}

                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Darf die Arbeitstundenwoche bei Vollzeitangestellten Mitarbeiter unterschritten werden?
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb5}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb5' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>

                        {/* New Line */}
                        
                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Darf die Arbeitstundenwoche bei Vollzeitangestellten Mitarbeiter überschritten werden?
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb6}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb6' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    
                </Box>
            </>
        )}
        {currentStep === 5 && (
            <>
                <Header
                title={t('company.title')}
                />
                <Box
                    display="grid"
                    gap="30px"
                    gridTemplateColumns="repeat(6, minmax(0, 1fr))"
                    sx={{
                        "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
                    }}
                    >
                    <Typography
                        color={colors.primary[100]}
                        variant=""
                        sx={{
                            gridColumn: "span 2",
                            display: "grid",
                            alignItems: "center",
                            height: "100%",
                        }}
                        ></Typography>
                        <Typography
                        color={colors.primary[100]}
                        variant=""
                        sx={{
                        gridColumn: "span 2",
                        display: "grid",
                        alignItems: "right",
                        textAlign: "right",
                        height: "100%",
                        }}
                    >
                        Ja, ist mir egal
                    </Typography>
                    <Typography
                        color={colors.primary[100]}
                        variant=""
                        sx={{
                        gridColumn: "span 2",
                        display: "grid",
                        alignItems: "right",
                        textAlign: "right",
                        height: "100%",
                        }}
                    >
                        Nein lieber nicht
                    </Typography>

                    {/* New Line */}
                        
                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Jeder Mitarbeiter soll in der gleichen Schicht innerhalb einer Woche arbeiten
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb7}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb7' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    {/* New Line */}
                        
                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Über mehrere Wochen sollen Mitarbeiter Wechselschichtig arbeiten
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb8}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb8' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    {/* New Line */}
                       
                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Pro Schicht muss eine Mindestanzahl an Stunden gearbeitet werden
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb9}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb9' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    {/* New Line */}
                        
                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Maximale Arbeitstage in Folge darf überschritten werden
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb10}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb10' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    {/* New Line */}
                        
                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Nebenbedingung 11
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb11}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb11' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                    {/* New Line */}
                        
                    <Typography
                        color={colors.primary[100]}
                        variant="h6"
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "left", 
                        height: "100%",
                        padding: "0 8px", 
                        backgroundColor: "#f0f0f0", 
                        }}
                    >
                        Nebenbedingung 12
                    </Typography>
                    <ToggleButtonGroup
                        value={formData.nb12}
                        exclusive
                        onChange={(_, newValue) => handleInputChange({
                            target: { value: newValue, name: 'nb12' }
                            })}
                        sx={{
                        gridColumn: "span 3",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                        }}
                    >
                        {[0, 1, 2, 3, 4, 5].map((value) => (
                        <ToggleButton 
                            key={value} 
                            value={value.toString()} 
                            aria-label={value.toString()}
                            sx={{
                            borderColor: 'gray',
                            borderWidth: 1,
                            borderStyle: 'solid',
                            color: 'black',  // Ensuring text color is black
                            '&.Mui-selected': {
                                backgroundColor: 'lightblue',
                                color: 'white',  // Ensuring selected text color is white
                            }
                            }}
                        >
                            {value}
                        </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>
            </>
        )}

        <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            mt={2} // margin-top for spacing
        >
            {currentStep > 1 && (
                <Button variant="outlined" onClick={handleBack} style={{ marginRight: '10px' }}>
                    Back
                </Button>
            )}
            {currentStep < 5 && (
                <Button variant="contained" color="primary" onClick={handleNext}>
                    Next
                </Button>
            )}
            {currentStep === 5 && (
                <Button variant="contained" color="secondary" onClick={handleSubmit}>
                    Submit
                </Button>
            )}
        </Box>

        </Box>           
    </Popup>
  );
};

export default QuickStartPopup;