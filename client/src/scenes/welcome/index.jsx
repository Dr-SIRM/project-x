import { useState, useEffect } from "react";
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Snackbar  } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from 'axios';
import { API_BASE_URL } from "../../config";
import QuickStartPopup from '../quickstart';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';


const Welcome = () => {
    const [initalSetup, setInitalSetup] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const token = localStorage.getItem('session_token');
  


    useEffect(() => {
        const fetchQuickStart = async () => {
            setIsLoading(true);
              try {
                const response = await axios.get(`${API_BASE_URL}/api/check_initial_setup`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setInitalSetup(response.data.initialSetupNeeded)
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching user details:', error);
                setIsLoading(false);
              }
          };
      
          fetchQuickStart();
        }, []);

    const handleFormSubmit = async (values) => {
    
    Object.keys(values).forEach((key) => {
      if (values[key] === '' || values[key] === undefined) {
        values[key] = undefined;
      }
    });

    try {
      // Send the updated form values to the server for database update
      await axios.post(`${API_BASE_URL}/api/company`, values, {
    headers: {
        'Authorization': `Bearer ${token}`
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating company details:', error);
      setShowErrorNotification(true);
    }
  };
  

  
  return (
    <div>
        <QuickStartPopup open={initalSetup} onClose={() => setInitalSetup(false)} />
        <h1>Welcome to Our Application</h1>
        {/* Additional content can go here */}
    </div>
    );
  };

export default Welcome;
