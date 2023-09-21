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
    setLoadingSteps(prev => [{...prev[0], status: "loading"}, ...prev.slice(1)]);
        
        setTimeout(() => {
            setLoadingSteps(prev => [{...prev[0], status: "completed"}, {...prev[1], status: "loading"}, ...prev.slice(2)]);
            
            // Simulate Data loading
            setTimeout(() => {
                setLoadingSteps(prev => [prev[0], {...prev[1], status: "completed"}, {...prev[2], status: "loading"}, ...prev.slice(3)]);
                
                // Simulate Database opened
                setTimeout(() => {
                    setLoadingSteps(prev => [prev[0], prev[1], {...prev[2], status: "completed"}, {...prev[3], status: "loading"}, prev[4]]);
                    
                    // Simulate Solution saved
                    setTimeout(() => {
                        setLoadingSteps(prev => [prev[0], prev[1], prev[2], {...prev[3], status: "completed"}, {...prev[4], status: "loading"}]);
                        
                        // Simulate Completion
                        setTimeout(() => {
                            setLoadingSteps(prev => [...prev.slice(0, 4), {...prev[4], status: "completed"}]);
                            
                            setShowSuccessNotification(true);
                        }, 3000);
                    }, 3000);
                }, 3000);
            }, 3000);
        }, 3000);
    try {
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/solver', { ...values, solverButtonClicked: true }, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        }
    });
    } catch (error) {
      console.error('Error updating solver details:', error);
      setShowErrorNotification(true);
    }
  };


  return (
    <Box m="20px">
      <Header
        title="Solve"
        subtitle="Create your optimized shift plan!"
      />
      <h2>TimeTab Solver</h2>

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
              <Button type="submit" color="secondary" variant="contained">
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
            <Typography variant="body1" style={{ marginLeft: "10px" }}>{step.label}</Typography>
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
