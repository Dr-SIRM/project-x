import { useState, useEffect } from "react";
import { useTheme, Box, Button, TextField, MenuItem, Select, FormControl, InputLabel, Snackbar, Typography  } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import axios from 'axios';
import { API_BASE_URL } from "../../config";
import QuickStartPopup from '../quickstart';
import { useTranslation } from 'react-i18next';
import '../../i18n'; 
import { tokens } from "../../theme";


const Welcome = () => {
    const [initalSetup, setInitalSetup] = useState(false);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);
    const [showErrorNotification, setShowErrorNotification] = useState(false);
    const [isLoading, setIsLoading] = useState(true); 
    const token = localStorage.getItem('session_token');
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  


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
                // console.log(response.data)
            } catch (error) {
                // console.error('Error fetching user details:', error);
                setIsLoading(false);
              }
          };
      
          fetchQuickStart();
        }, []);

  return (
    <div>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center" 
        minHeight="100vh"
      >
        <QuickStartPopup open={initalSetup} onClose={() => setInitalSetup(false)} />
        <Typography 
          variant="h1" 
          color={colors.primary[100]} 
          paddingBottom={"10px"}
        >
          {t('welcome.title')}
        </Typography>
        {/* Additional content can go here */}
      </Box>
    </div>
    );
  };

export default Welcome;
