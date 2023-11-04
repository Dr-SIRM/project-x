import { useState, useEffect, useContext } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';
import { API_BASE_URL } from "../../config";
import { useTranslation } from 'react-i18next';
import '../../i18n';  



const SolverReq = ({ solverreq }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [solverData, setsolverData] = useState({});
  const token = localStorage.getItem('session_token'); // Get the session token from local storage
  const { t, i18n } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const fetchSolver = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/solver/requirement`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setsolverData(response.data);
        } catch (error) {
          console.error('Error fetching Solver details:', error);
        }
    };

    fetchSolver();
  }, []);

  
  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post(`${API_BASE_URL}/api/solver/requirement`, { ...values }, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating solver details:', error);
      setShowErrorNotification(true);
    }
  };


  return (
    <Box m="20px">
      <Header
        title={t('solverreq.title')}
        subtitle={t('solverreq.subtitle')}
      />

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{
          company_name: solverData.company_name,
          weekly_hours: solverData.weekly_hours,
          shifts: solverData.shifts,
          desired_min_time_day: solverData.desired_min_time_day,
          desired_max_time_day: solverData.desired_max_time_day,
          min_time_day: solverData.min_time_day,
          max_time_day: solverData.max_time_day,
          desired_max_time_week: solverData.desired_max_time_week,
          max_time_week: solverData.max_time_week,
          hour_devider: String(solverData.hour_devider),
          fair_distribution: solverData.fair_distribution,
          week_timeframe: String(solverData.week_timeframe),
          subsequent_workingdays: solverData.subsequent_workingdays,
          daily_deployment: solverData.daily_deployment,
          time_per_deployment: solverData.time_per_deployment,
          nb1: String(solverData.nb1),
          nb2: String(solverData.nb2),
          nb3: String(solverData.nb3),
          nb4: String(solverData.nb4),
          nb5: String(solverData.nb5),
          nb6: String(solverData.nb6),
          nb7: String(solverData.nb7),
          nb8: String(solverData.nb8),
          nb9: String(solverData.nb9),
          nb10: String(solverData.nb10),
          nb11: String(solverData.nb11),
          nb12: String(solverData.nb12),
          nb13: String(solverData.nb13),
          nb14: String(solverData.nb14),
          nb15: String(solverData.nb15),
          nb16: String(solverData.nb16),
          nb17: String(solverData.nb17),
          nb18: String(solverData.nb18),
          nb19: String(solverData.nb19),
          nb20: String(solverData.nb20)
        }}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>   
          <br></br>
          <Typography variant="h5">{t('solverreq.Mindestanforderungen')}</Typography>        
            <br></br>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(10, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 10" },
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
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.desired_min_time_day}
                name="desired_min_time_day"
                error={!!touched.desired_min_time_day && !!errors.desired_min_time_day}
                helperText={touched.desired_min_time_day && errors.desired_min_time_day}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.min_time_day}
                name="min_time_day"
                error={!!touched.min_time_day && !!errors.min_time_day}
                helperText={touched.min_time_day && errors.min_time_day}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.desired_max_time_day}
                name="desired_max_time_day"
                error={!!touched.desired_max_time_day && !!errors.desired_max_time_day}
                helperText={touched.desired_max_time_day && errors.desired_max_time_day}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.max_time_day}
                name="max_time_day"
                error={!!touched.max_time_day && !!errors.max_time_day}
                helperText={touched.max_time_day && errors.max_time_day}

                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.max_time_week}
                name="max_time_week"
                error={!!touched.max_time_week && !!errors.max_time_week}
                helperText={touched.max_time_week && errors.max_time_week}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.fair_distribution}
                name="fair_distribution"
                error={!!touched.fair_distribution && !!errors.fair_distribution}
                helperText={touched.fair_distribution && errors.fair_distribution}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                  {t('solverreq.hourunit')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.hour_devider}
                name="hour_devider"
                error={!!touched.hour_devider && !!errors.hour_devider}
                helperText={touched.hour_devider && errors.hour_devider}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                  {t('solverreq.calculationtimeframe')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.week_timeframe}
                name="week_timeframe"
                error={!!touched.week_timeframe && !!errors.week_timeframe}
                helperText={touched.week_timeframe && errors.week_timeframe}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                  {t('solverreq.maxworkingdayinarow')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.subsequent_workingdays}
                name="subsequent_workingdays"
                error={!!touched.subsequent_workingdays && !!errors.subsequent_workingdays}
                helperText={touched.subsequent_workingdays && errors.subsequent_workingdays}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                  {t('solverreq.countofshiftsperday')}
                </Typography>
                <TextField
                fullWidth
                variant="filled"
                type="text"
                label=''
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.daily_deployment}
                name="daily_deployment"
                error={!!touched.daily_deployment && !!errors.daily_deployment}
                helperText={touched.daily_deployment && errors.daily_deployment}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.time_per_deployment}
                name="time_per_deployment"
                error={!!touched.time_per_deployment && !!errors.time_per_deployment}
                helperText={touched.time_per_deployment && errors.time_per_deployment}
                sx={{
                  gridColumn: "span 1",
                  maxWidth: '50px',
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
            <br></br>
            <br></br>
            <Typography variant="h5">Zusatzanforderungen</Typography> 
              <br></br>
              <br></br>
              <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(18, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 18" },
              }}
            >
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 10",
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
                  alignItems: "left",
                  textAlign: "left",
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
              <Typography
                color={colors.primary[100]}
                variant=""
                sx={{
                  gridColumn: "span 4",
                  display: "grid",
                  alignItems: "right",
                  height: "100%",
                }}
              ></Typography>
              {/* New Line */}
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  gridColumn: "span 1",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb1}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb1' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  gridColumn: "span 1",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb2}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb2' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  gridColumn: "span 1",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb3}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb3' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb4}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb4' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb5}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb5' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb6}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb6' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb7}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb7' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb8}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb8' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb9}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb9' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb10}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb10' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb11}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb11' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
                {/* New Line */}
                <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.primary[100]}
                variant="h6"
                sx={{
                  gridColumn: "span 9",
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
                value={values.nb12}
                exclusive
                onChange={(_, newValue) => handleChange({
                  target: { value: newValue, name: 'nb12' }
                })}
                onBlur={handleBlur}
                sx={{
                  gridColumn: "span 4",
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
              <Typography
                  color={colors.primary[100]}
                  variant=""
                  sx={{
                    gridColumn: "span 4",
                    display: "grid",
                    alignItems: "center",
                    height: "100%",
                  }}
                ></Typography>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
            <Button 
                type="submit" 
                color="primary" 
                variant="contained">
                Submit
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Snackbar
        open={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        message="Solver Successfully Started!"
        autoHideDuration={3000}
        sx={{
          backgroundColor: "green !important",
          color: "white",
          "& .MuiSnackbarContent-root": {
            borderRadius: "4px",
            padding: "15px",
            fontSize: "16px",
          },
        }}
      />
      <Snackbar
        open={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        message="Error occurred - Solver Stopped!"
        autoHideDuration={3000}
        sx={{
          backgroundColor: "red !important",
          color: "white",
          "& .MuiSnackbarContent-root": {
            borderRadius: "4px",
            padding: "15px",
            fontSize: "16px",
          },
        }}
      />
    </Box>
  );
};

export default SolverReq;