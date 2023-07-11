import { useState, useEffect, useContext } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';



const Solver = ({ solver }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [solverData, setsolverData] = useState({});
  const token = localStorage.getItem('session_token'); // Get the session token from local storage

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
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/solver', { ...values, solverButtonClicked: true }, {
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
