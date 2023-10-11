import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress, Snackbar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Formik } from "formik";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config";
import axios from "axios";

// Arrow Function in JawaScript
const Solver = () => {
    const [loadingSteps, setLoadingSteps] = useState([
        { label: "1. Überprüfen, ob der Admin zu jeder Öffnungszeitstunde time_req eingegeben hat", status: null },
        { label: "2. Überprüfen ob die Vollzeit Mitarbeiter mind. self.weekly_hours Stunden einplant haben", status: null },
        { label: "3. Haben die Mitarbeiter mindestens die anzahl Stunden von gerechte_verteilung eingegeben?", status: null },
        { label: "4. Haben alle MA zusammen genug Stunden eingegeben, um die verteilbaren Stunden zu erreichen?", status: null },
        { label: "5. Ist zu jeder notwendigen Zeit (self.min_anwesend) die mindestanzahl Mitarbeiter verfügbar?", status: null },
        { label: "6. Können die MA die min. Zeit täglich erreichen? Wenn 0 Stunden eingegeben wurden, läuft es durch!", status: null }
    ]);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false);

    // "Hook" in react, wir dazu genutzt, Nebeneffekte in funktionalen Komponenten zu verwalten
    useEffect(() => {
        const socket = io(API_BASE_URL);

        // "pre_check_update" muss in routes_react und hier gleich sein, um sicherzustellen, das die kommunikation funktioniert
        socket.on("pre_check_update", (update) => {
            setLoadingSteps(prev => prev.map((step, index) => {
                if (index === update.pre_check_number - 1) {
                    return {
                        ...step,
                        status: update.status,
                        errorMessage: update.status === "error" ? update.message : null
                    };
                }
                return step;
            }));
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleFormSubmit = async (values) => {
      try {
          const token = localStorage.getItem('session_token');  // Get the session token from local storage
          const response = await axios.post(`${API_BASE_URL}/api/solver`, { ...values, solverButtonClicked: true }, {
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
            <Typography variant="h3">TimeTab Solver</Typography>
            <Formik
                onSubmit={handleFormSubmit}
                enableReinitialize={true}
                initialValues={{}}
            >
                {({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <Box display="flex" justifyContent="end" mt="20px">
                            <Button type="submit" color="primary" variant="contained">
                                Solve
                            </Button>
                        </Box>
                    </form>
                )}
            </Formik>
            <div>
                {loadingSteps.map((step, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", marginTop: "10px" }}>
                        {step.status === "loading" && <CircularProgress size={20} />}
                        {step.status === "completed" && <CheckCircleIcon style={{ color: "green" }} />}
                        {step.status === "error" && <ErrorOutlineIcon style={{ color: "red" }} />}
                        <Typography variant="body1" style={{ marginLeft: "10px", color: "black" }}>
                            {step.label}
                        </Typography>
                        {step.status === "error" && (
                            <Typography variant="body2" style={{ marginLeft: "10px", color: "red" }}>
                                {step.errorMessage}
                            </Typography>
                        )}
                    </div>
                ))}
            </div>
            <Snackbar
                open={showSuccessNotification}
                onClose={() => setShowSuccessNotification(false)}
                message="Der Solver wurde erfolgreich gestartet!"
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
                message="Der Solver wurde gestoppt!"
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
