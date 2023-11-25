import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress, Snackbar, MenuItem, InputLabel, Select, Dialog, DialogTitle, DialogContent } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Formik } from "formik";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config";
import axios from "axios";
import { useTranslation } from 'react-i18next';
import '../../i18n';  

// Arrow Function in JawaScript
const Solver = () => {
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false);
    const [selectedWeek, setSelectedWeek] = useState();
    const token = localStorage.getItem('session_token');
    const { t, i18n } = useTranslation();
    const [currentWeekNum, setCurrentWeekNum] = useState();
    const [mondayDate, setMondayDate] = useState();
    const [openDialog, setOpenDialog] = useState(false);
    const [solvingCompleted, setSolvingCompleted] = useState(false);
    const [hasError, setHasError] = useState(false);


    const [loadingSteps, setLoadingSteps] = useState([
        { label: t('solver.precheck1') , status: 'loading' },
        { label: t('solver.precheck2') , status: 'loading' },
        { label: t('solver.precheck3') , status: 'loading' },
        { label: t('solver.precheck4') , status: 'loading' },
        { label: t('solver.precheck5') , status: 'loading' },
        // { label: "6. Vorüberprüfung: ", status: 'loading' }
    ]);

    // "Hook" in react, wir dazu genutzt, Nebeneffekte in funktionalen Komponenten zu verwalten
    useEffect(() => {
        const socket = io(API_BASE_URL);

        // "pre_check_update" muss in routes_react und hier gleich sein, um sicherzustellen, das die kommunikation funktioniert
        socket.on("pre_check_update", (update) => {
            setLoadingSteps(prev => {
                const updatedSteps = prev.map((step, index) => {
                    if (index === update.pre_check_number - 1) {
                        return {
                            ...step,
                            status: update.status,
                            errorMessage: update.status === "error" ? update.message : null
                        };
                    }
                    return step;
                });
        
                // Check if all steps are completed and if there is an error
                const allCompleted = updatedSteps.every(step => step.status === "completed");
                const anyError = updatedSteps.some(step => step.status === "error");
        
                if (allCompleted) {
                    setSolvingCompleted(true);
                }
        
                if (anyError) {
                    setHasError(true);
                }
        
                return updatedSteps;
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleWeekChange = (event) => {
        setSelectedWeek(event.target.value);
      };
      
    const calculateWeekDetails = () => {
        const today = new Date();
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        const pastDaysOfYear = (today - firstDayOfYear) / 86400000; // milliseconds in a day
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

        // Calculating the date of the Monday of the current week
        const dayOfWeek = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjusting to the previous Monday

        return { weekNumber, monday };
    };

    const formatDate = (date) => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // JavaScript months are 0-indexed
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    useEffect(() => {
        const { weekNumber, monday } = calculateWeekDetails();
        setCurrentWeekNum(weekNumber);
        setMondayDate(monday.toISOString().split('T')[0]); // Set the Monday date in 'YYYY-MM-DD' format
    }, []);

    const newDate = (dateString, days) => {
        const date = new Date(dateString);
        date.setDate(date.getDate() + days);
        return formatDate(date); // Reuse the formatDate function
    };

    const handleFormSubmit = async (values) => {
        setOpenDialog(true);
      try {
        const payload = {
            ...values,
            startWeek: selectedWeek,  // Add the selectedWeek as startWeek
            solverButtonClicked: true
        };
          const response = await axios.post(`${API_BASE_URL}/api/solver`, payload, {
              headers: {
                  'Authorization': `Bearer ${token}`,  // Add authorization header
                  'Content-Type': 'application/json',
              }
          });
  
          if (response.data.message === 'Der Solver wurde erfolgreich gestartet!') {
              setShowSuccessNotification(true);
          } else {
              setShowErrorNotification(true);
          }
      } catch (error) {
          console.error('Error updating solver details:', error);
          setShowErrorNotification(true);
      }
  };
  

    return (
        <Box m="20px">
            <Typography variant="h3">{t('solver.title')}</Typography>
            <div style={{ display: 'flex', gap: '5px', marginTop: '30px', marginBottom: '30px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <InputLabel id="start-week-label" style={{ marginBottom: '5px' }}>{t('solver.selection_area')}</InputLabel> {/* Label for the first select */}
                </div>
                    <Select
                        labelId="simple-select-label"
                        id="simple-select"
                        value={selectedWeek}
                        onChange={handleWeekChange}
                        style={{ width: '120px' }}  // Assuming you want the dropdown text to be white
                        size="small"
                    >
                        <MenuItem value={1}>{t('solver.week')} {currentWeekNum} - Mo {newDate(mondayDate, 7)}</MenuItem>
                        <MenuItem value={2}>{t('solver.week')} {currentWeekNum+1} - Mo {newDate(mondayDate, 14)}</MenuItem>
                        <MenuItem value={3}>{t('solver.week')} {currentWeekNum+2} - Mo {newDate(mondayDate, 21)}</MenuItem>
                        <MenuItem value={4}>{t('solver.week')} {currentWeekNum+3} - Mo {newDate(mondayDate, 28)}</MenuItem>
                        <MenuItem value={4}>{t('solver.week')} {currentWeekNum+4} - Mo {newDate(mondayDate, 35)}</MenuItem>
                    </Select>
            </div>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>{t('solver.loading_steps')}</DialogTitle>
                <DialogContent>
                    {!solvingCompleted ? (
                        loadingSteps.map((step, index) => (
                            <div key={index} style={{ display: "flex", alignItems: "flex-start", margin: "10px 0" }}>
                                <div style={{ marginRight: "10px" }}>
                                    {step.status === "loading" && <CircularProgress size={20} />}
                                    {step.status === "completed" && <CheckCircleIcon style={{ color: "green" }} />}
                                    {step.status === "error" && <ErrorOutlineIcon style={{ color: "red" }} />}
                                </div>
                                <div>
                                    <Typography variant="body1">{step.label}</Typography>
                                    {step.status === "error" && (
                                        <Typography variant="body2" style={{ color: "red" }}>
                                            <span dangerouslySetInnerHTML={{ __html: step.errorMessage.replace(/\n/g, '<br />') }} />
                                        </Typography>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : hasError ? (
                        <div style={{ textAlign: "center" }}>
                            <ErrorOutlineIcon style={{ color: "red", fontSize: 60 }} />
                            <Typography variant="h6" style={{ color: "red", marginTop: "20px" }}>
                                {t('solver.error_message')}
                            </Typography>
                        </div>
                    ) : (
                        <div style={{ textAlign: "center" }}>
                            <CheckCircleIcon style={{ color: "green", fontSize: 60 }} />
                            <Typography variant="h6" style={{ color: "green", marginTop: "20px" }}>
                                {t('solver.success_message')}
                            </Typography>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
            <div>
                {solvingCompleted && (
                    <Box>
                        {loadingSteps.map((step, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "flex-start", margin: "10px 0" }}>
                            <div style={{ marginRight: "10px" }}>
                                {step.status === "loading" && <CircularProgress size={20} />}
                                {step.status === "completed" && <CheckCircleIcon style={{ color: "green" }} />}
                                {step.status === "error" && <ErrorOutlineIcon style={{ color: "red" }} />}
                            </div>
                            <div>
                                <Typography variant="body1" style={{ color: "black" }}>{step.label}</Typography>
                                {step.status === "error" && (
                                    <Typography variant="body2" style={{ color: "red" }}>
                                        <span dangerouslySetInnerHTML={{ __html: step.errorMessage.replace(/\n/g, '<br />') }} />
                                    </Typography>
                                )}
                            </div>
                        </div>
                    ))}
                    </Box>
                )}
            </div>

            <div>
            <Formik
                onSubmit={handleFormSubmit}
                enableReinitialize={true}
                initialValues={{}}
            >
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Box display="flex" justifyContent="start" mt="20px" style={{ display: 'flex', gap: '10px', marginTop: '40px' }}>
                            <Button type="submit" color="primary" variant="contained">
                            {t('button.solve')} 
                            </Button>
                        </Box>
                    </form>
                )}
            </Formik>
            </div>
            <Snackbar
                open={showSuccessNotification}
                onClose={() => setShowSuccessNotification(false)}
                message={t('notification.success_solver')} 
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
                message={t('notification.no_success_solver')} 
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

export default Solver;
