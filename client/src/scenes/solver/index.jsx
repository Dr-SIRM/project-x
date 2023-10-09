import React, { useState, useEffect } from "react";
import { Box, Button, Typography, CircularProgress, Snackbar } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { Formik } from "formik";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config";
import axios from "axios";

const Solver = () => {
    const [loadingSteps, setLoadingSteps] = useState([
        { label: "Button initiated Pre Check 1", status: null },
        { label: "Data loading Pre Check 2", status: null },
        { label: "Database opened Pre Check 3", status: null },
        { label: "Solution saved Pre Check 4", status: null },
        { label: "Completion Pre Check 5", status: null },
        { label: "Completion Pre Check 6", status: null }
    ]);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false);

    useEffect(() => {
        const socket = io(API_BASE_URL);

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
  
          if (response.data.message === 'Solver successfully started') {
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

export default Solver;
