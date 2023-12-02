import React, { useState, useEffect } from "react";
import {
  useTheme,
  Box,
  Button,
  Typography,
  CircularProgress,
  Snackbar,
  MenuItem,
  InputLabel,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Formik } from "formik";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config";
import { tokens } from "../../theme";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "../../i18n";

// Arrow Function in JawaScript
const Solver = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState();
  const token = localStorage.getItem("session_token");
  const { t, i18n } = useTranslation();
  const [currentWeekNum, setCurrentWeekNum] = useState();
  const [mondayDate, setMondayDate] = useState();
  const [openDialog, setOpenDialog] = useState(false);
  const [solvingCompleted, setSolvingCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [solveTime, setSolveTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [solutionCompletion, setSolutionCompletion] = useState();

  const [loadingSteps, setLoadingSteps] = useState([
    { label: t("solver.precheck1"), status: "loading" },
    { label: t("solver.precheck2"), status: "loading" },
    { label: t("solver.precheck3"), status: "loading" },
    { label: t("solver.precheck4"), status: "loading" },
    { label: t("solver.precheck5"), status: "loading" },
    // { label: "6. Vorüberprüfung: ", status: 'loading' }
  ]);

  // "Hook" in react, wir dazu genutzt, Nebeneffekte in funktionalen Komponenten zu verwalten
  useEffect(() => {
    const socket = io(API_BASE_URL);

    // "pre_check_update" muss in routes_react und hier gleich sein, um sicherzustellen, das die kommunikation funktioniert
    socket.on("pre_check_update", (update) => {
      setLoadingSteps((prev) => {
        const updatedSteps = prev.map((step, index) => {
          if (index === update.pre_check_number - 1) {
            return {
              ...step,
              status: update.status,
              errorMessage: update.status === "error" ? update.message : null,
            };
          }
          return step;
        });

        // Check if all steps are completed and if there is an error
        const allCompleted = updatedSteps.every(
          (step) => step.status === "completed"
        );
        const anyError = updatedSteps.some((step) => step.status === "error");

        if (allCompleted && !anyError) {
          // Add a delay of 2 seconds after all pre-checks are completed
          setTimeout(() => {
            setSolvingCompleted(true);
          }, 2000); // 2000 milliseconds delay
        } else if (anyError) {
          setHasError(true);
        }

        return updatedSteps;
      });
    });

    socket.on("solve_time", (data) => {
      setSolveTime(data.time);
    });

    socket.on("solution_completion", (data) => {
      setSolutionCompletion(data.solution);
      // console.log("Complete: ", data.solution)
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    let interval = null;
  
    if (solveTime > 0) {
      interval = setInterval(() => {
        setProgress((oldProgress) => {
          const progressIncrement = 100 / solveTime;
          const newProgress = oldProgress + progressIncrement;
          console.log("Calc Time: ", oldProgress, progressIncrement, solveTime, newProgress)
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 1000); // Update every second
    } else {
      setProgress(0); // Reset progress if conditions are not met
    }
  
    return () => {
      clearInterval(interval);
    };
  }, [solveTime, solvingCompleted]);


  useEffect(() => {
    if (solutionCompletion === 1 || solutionCompletion === 0) {
      // Calculate the remaining time to reach 100%
      const remainingTimeToComplete = 3000; // 3 seconds in milliseconds
  
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          const progressIncrement = (100 - oldProgress) / (remainingTimeToComplete / 1000);
          const newProgress = oldProgress + progressIncrement;
          return newProgress >= 100 ? 100 : newProgress;
        });
      }, 100); // Update every 100ms for a smoother transition
  
      const timeout = setTimeout(() => {
        clearInterval(interval); // Clear the interval after 3 seconds
        setSolvingCompleted(true);
      }, remainingTimeToComplete);
  
      return () => {
        clearTimeout(timeout);
        clearInterval(interval);
      };
    }
  }, [solutionCompletion]);

  

  const handleWeekChange = (event) => {
    setSelectedWeek(event.target.value);
  };

  const calculateWeekDetails = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000; // milliseconds in a day
    const weekNumber = Math.ceil(
      (pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7
    );

    // Calculating the date of the Monday of the current week
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjusting to the previous Monday

    return { weekNumber, monday };
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // JavaScript months are 0-indexed
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  useEffect(() => {
    const { weekNumber, monday } = calculateWeekDetails();
    setCurrentWeekNum(weekNumber);
    setMondayDate(monday.toISOString().split("T")[0]); // Set the Monday date in 'YYYY-MM-DD' format
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
        startWeek: selectedWeek, // Add the selectedWeek as startWeek
        solverButtonClicked: true,
      };
      const response = await axios.post(`${API_BASE_URL}/api/solver`, payload, {
        headers: {
          Authorization: `Bearer ${token}`, // Add authorization header
          "Content-Type": "application/json",
        },
      });

      if (response.data.message === "Der Solver wurde erfolgreich gestartet!") {
        setShowSuccessNotification(true);
      } else {
        setShowErrorNotification(true);
      }
    } catch (error) {
      // console.error("Error updating solver details:", error);
      setShowErrorNotification(true);
    }
  };

  return (
    <Box m="20px">
      <Typography variant="h3">{t("solver.title")}</Typography>
      <div
        style={{
          display: "flex",
          gap: "5px",
          marginTop: "30px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <InputLabel id="start-week-label" style={{ marginBottom: "5px" }}>
            {t("solver.selection_area")}
          </InputLabel>{" "}
          {/* Label for the first select */}
        </div>
        <Select
          labelId="simple-select-label"
          id="simple-select"
          value={selectedWeek}
          onChange={handleWeekChange}
          style={{ width: "120px" }} // Assuming you want the dropdown text to be white
          size="small"
        >
          <MenuItem value={1}>
            {t("solver.week")} {currentWeekNum + 1} - Mo {newDate(mondayDate, 7)}
          </MenuItem>
          <MenuItem value={2}>
            {t("solver.week")} {currentWeekNum + 2} - Mo{" "}
            {newDate(mondayDate, 14)}
          </MenuItem>
          <MenuItem value={3}>
            {t("solver.week")} {currentWeekNum + 3} - Mo{" "}
            {newDate(mondayDate, 21)}
          </MenuItem>
          <MenuItem value={4}>
            {t("solver.week")} {currentWeekNum + 4} - Mo{" "}
            {newDate(mondayDate, 28)}
          </MenuItem>
          <MenuItem value={4}>
            {t("solver.week")} {currentWeekNum + 5} - Mo{" "}
            {newDate(mondayDate, 35)}
          </MenuItem>
        </Select>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{t("solver.loading_steps")}</DialogTitle>
        <DialogContent>
          {!solvingCompleted ? (
            loadingSteps.map((step, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  margin: "10px 0",
                }}
              >
                <div style={{ marginRight: "10px" }}>
                  {step.status === "loading" && <CircularProgress size={20} style={{ color: colors.greenAccent[400] }}/>}
                  {step.status === "completed" && (
                    <CheckCircleIcon style={{ color: colors.greenAccent[600] }} />
                  )}
                  {step.status === "error" && (
                    <ErrorOutlineIcon style={{ color: "red" }} />
                  )}
                </div>
                <div>
                  <Typography variant="body1">{step.label}</Typography>
                  {step.status === "error" && (
                    <Typography variant="body2" style={{ color: "red" }}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: step.errorMessage.replace(/\n/g, "<br />"),
                        }}
                      />
                    </Typography>
                  )}
                </div>
              </div>
            ))
          ) : hasError ? (
            <div style={{ textAlign: "center" }}>
              <ErrorOutlineIcon style={{ color: "red", fontSize: 60 }} />
              <Typography
                variant="h6"
                style={{ color: "red", marginTop: "20px" }}
              >
                {t("solver.error_message")}
              </Typography>
            </div>
          ) : progress < 100 ? (
            <div style={{ textAlign: "center" }}>
              <CircularProgress 
                variant="determinate" 
                value={progress} 
                size={50} 
                style={{ color: colors.greenAccent[600] }} // Assuming colors.greenAccent[400] is a valid color
              />
              <Typography style={{ margin: '10px 0' }}>
                Loading... {Math.round(progress)}%
              </Typography>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              {solutionCompletion === 0 ? (
                <>
                  <ErrorOutlineIcon style={{ color: "red", fontSize: 60 }} />
                  <Typography
                    variant="h6"
                    style={{ color: "red", marginTop: "20px" }}
                  >
                    {t("solver.error_message")}
                  </Typography>
                </>
              ) : (
                <>
                  <CheckCircleIcon style={{ color: colors.greenAccent[600], fontSize: 60 }} />
                  <Typography
                    variant="h6"
                    style={{ color: colors.greenAccent[600], marginTop: "20px" }}
                  >
                    {t("solver.success_message")}
                  </Typography>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      <div>
        {solvingCompleted && (
          <Box>
            {loadingSteps.map((step, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  margin: "10px 0",
                }}
              >
                <div style={{ marginRight: "10px" }}>
                  {step.status === "loading" && <CircularProgress size={20} />}
                  {step.status === "completed" && (
                    <CheckCircleIcon style={{ color: colors.greenAccent[600] }} />
                  )}
                  {step.status === "error" && (
                    <ErrorOutlineIcon style={{ color: "red" }} />
                  )}
                </div>
                <div>
                  <Typography variant="body1" style={{ color: "black" }}>
                    {step.label}
                  </Typography>
                  {step.status === "error" && (
                    <Typography variant="body2" style={{ color: "red" }}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: step.errorMessage.replace(/\n/g, "<br />"),
                        }}
                      />
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
              <Box
                display="flex"
                justifyContent="start"
                mt="20px"
                style={{ display: "flex", gap: "10px", marginTop: "40px" }}
              >
                <Button type="submit" color="primary" variant="contained">
                  {t("button.solve")}
                </Button>
              </Box>
            </form>
          )}
        </Formik>
      </div>
    </Box>
  );
};

export default Solver;
