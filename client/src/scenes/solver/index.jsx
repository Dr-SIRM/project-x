import { useState, useEffect, useContext } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";



const Solver = ({ solver }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [solverData, setsolverData] = useState({});
  const token = localStorage.getItem('session_token'); // Get the session token from local storage
  const [loadingSteps, setLoadingSteps] = useState([
    { label: "Button initiated", status: null },
    { label: "Data loading", status: null },
    { label: "Database opened", status: null },
    { label: "Solution saved", status: null },
    { label: "Completion", status: null }
  ]);

  useEffect(() => {
    const fetchSolver = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/solver', {
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
        console.log('Submitting form with values:', values);  // Log values being sent
        setLoadingSteps(prev => [{...prev[0], status: "loading"}, ...prev.slice(1)]);
        
        const response = await axios.post('http://localhost:5000/api/solver', { ...values, solverButtonClicked: true }, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        
        console.log('Response from server:', response.data);  // Log server response

        if(response.data.message === 'Solver successfully started') {
            // Update all steps to "completed"
            setLoadingSteps(prev => prev.map(step => ({...step, status: "completed"})));
            setShowSuccessNotification(true);
        } else {
            // Update the steps based on the failed pre-check (if needed).
            // Example: If pre-check 2 failed, steps 0 and 1 will be "completed", step 2 "error", and others "null".
            const failedStep = response.data.message.match(/Pre-check (\d) failed/)?.[1];
            if (failedStep) {
                setLoadingSteps(prev => prev.map((step, index) => {
                    return index < failedStep - 1 
                        ? {...step, status: "completed"}
                        : index === failedStep - 1 
                            ? {...step, status: "error", errorMessage: response.data.message}
                            : step;
                }));
            }
            setShowErrorNotification(true);
        }
    } catch (error) {
      console.error('Error updating solver details:', error);
      console.error('Error details:', error.response?.data);  // Log error response from server
        setShowErrorNotification(true);
    }
};



  return (
    <Box m="20px">
      <Header
        title="Solve"
        subtitle="Create your optimized shift plan!"
      />
      <Typography variant="h3">TimeTab Solver</Typography>

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{}}
      >
        {({
          handleSubmit,
        }) => (
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
