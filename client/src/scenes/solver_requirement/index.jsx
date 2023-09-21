import { useState, useEffect, useContext } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';



const SolverReq = ({ solverreq }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [solverData, setsolverData] = useState({});
  const token = localStorage.getItem('session_token'); // Get the session token from local storage

  const [isChecked, setIsChecked] = useState(false);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    const fetchSolver = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/solver/requirement', {
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
      await axios.post('http://localhost:5000/api/solver/requirement', { ...values }, {
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
        title="Solver Anforderungen"
        subtitle="Bestimme deinen Einsatzplan nach deinen Bedürfnissen!"
      />
      <h2>Anforderungen</h2>

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
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(10, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 10" },
              }}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 5",
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              >
                Gewünschte Mindestanzahl Arbeitsstunden pro Tag
              </Typography>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={!isChecked} // Disable textfield if checkbox isn't checked
                sx={{
                  gridColumn: "span 3",
                  display: "flex",
                  alignItems: "left",
                  height: "100%",
                }}
              />
              
              </Box>
              <br></br>
              <br></br>
              <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(6, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
              }}
            >
            <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Gewünschte min. Zeit pro Tag
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
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
            <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Min. Zeit pro Tag
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.min_time_day}
                name="min_time_day"
                error={!!touched.min_time_day && !!errors.min_time_day}
                helperText={touched.min_time_day && errors.min_time_day}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 2",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Max. Zeit pro Tag
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.max_time_day}
                name="max_time_day"
                error={!!touched.max_time_day && !!errors.max_time_day}
                helperText={touched.max_time_day && errors.max_time_day}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Gewünschte max. Zeit pro Tag
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.desired_max_time_day}
                name="desired_max_time_day"
                error={!!touched.desired_max_time_day && !!errors.desired_max_time_day}
                helperText={touched.desired_max_time_day && errors.desired_max_time_day}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 2",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Max. Zeit pro Woche
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.max_time_week}
                name="max_time_week"
                error={!!touched.max_time_week && !!errors.max_time_week}
                helperText={touched.max_time_week && errors.max_time_week}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Toleranz gerechte Verteilung
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.fair_distribution}
                name="fair_distribution"
                error={!!touched.fair_distribution && !!errors.fair_distribution}
                helperText={touched.fair_distribution && errors.fair_distribution}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 2",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Stunden Teiler
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.hour_devider}
                name="hour_devider"
                error={!!touched.hour_devider && !!errors.hour_devider}
                helperText={touched.hour_devider && errors.hour_devider}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              >
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                </Select>
                <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Solver Zeitraum
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.week_timeframe}
                name="week_timeframe"
                error={!!touched.week_timeframe && !!errors.week_timeframe}
                helperText={touched.week_timeframe && errors.week_timeframe}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              >
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                </Select>
                <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 2",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 1
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb1}
                name="nb1"
                error={!!touched.nb1 && !!errors.nb1}
                helperText={touched.nb1 && errors.nb1}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
              >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 2
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb2}
                name="nb2"
                error={!!touched.nb2 && !!errors.nb2}
                helperText={touched.nb2 && errors.nb2}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 3
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb3}
                name="nb3"
                error={!!touched.nb3 && !!errors.nb3}
                helperText={touched.nb3 && errors.nb3}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 4
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb4}
                name="nb4"
                error={!!touched.nb4 && !!errors.nb4}
                helperText={touched.nb4 && errors.nb4}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 5
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb5}
                name="nb5"
                error={!!touched.nb5 && !!errors.nb5}
                helperText={touched.nb5 && errors.nb5}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 6
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb6}
                name="nb6"
                error={!!touched.nb6 && !!errors.nb6}
                helperText={touched.nb6 && errors.nb6}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 7
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb7}
                name="nb7"
                error={!!touched.nb7 && !!errors.nb7}
                helperText={touched.nb7 && errors.nb7}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 8
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb8}
                name="nb8"
                error={!!touched.nb8 && !!errors.nb8}
                helperText={touched.nb8 && errors.nb8}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 9
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb9}
                name="nb9"
                error={!!touched.nb9 && !!errors.nb9}
                helperText={touched.nb9 && errors.nb9}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 10
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb10}
                name="nb10"
                error={!!touched.nb10 && !!errors.nb10}
                helperText={touched.nb10 && errors.nb10}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 11
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb11}
                name="nb11"
                error={!!touched.nb11 && !!errors.nb11}
                helperText={touched.nb11 && errors.nb11}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 12
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb12}
                name="nb12"
                error={!!touched.nb12 && !!errors.nb12}
                helperText={touched.nb12 && errors.nb12}
                sx={{
                  gridColumn: "span 1",
                  '& .MuiFilledInput-input': {
                    paddingTop: '10px',
                    paddingBottom: '10px',
                  },
                }}
                >
                <MenuItem value={ '0' }>0</MenuItem>
                <MenuItem value={ '1' }>1</MenuItem>
                <MenuItem value={ '2' }>2</MenuItem>
                <MenuItem value={ '3' }>3</MenuItem>
                <MenuItem value={ '4' }>4</MenuItem>
                <MenuItem value={ '5' }>5</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
            <Button 
                type="submit" 
                color="secondary" 
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