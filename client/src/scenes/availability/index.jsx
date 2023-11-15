import { useState, useEffect } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography, ButtonGroup, IconButton } from "@mui/material";
import { Select, MenuItem, FormControl, InputLabel, Checkbox } from "@mui/material";
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { ThreeDots } from "react-loader-spinner"; 
import axios from 'axios';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { API_BASE_URL } from "../../config";
import { useTranslation } from 'react-i18next';
import '../../i18n';  

const BUTTON_STYLE = {
  borderColor: "white",
  "&.MuiButtonOutlined": {
    borderColor: "white",
  },
  "&:hover": {
    borderColor: "white",
  },
  "&.MuiButtonText": {
    borderColor: "white",
    color: "white",
    backgroundColor: "#2e7c67",
  },
};

const Availability = ({ availability }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [availabilityData, setAvailabilityData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [weekAdjustment, setWeekAdjustment] = useState(0);
  const token = localStorage.getItem('session_token'); 
  const [additionalTimes, setAdditionalTimes] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [activeTemplateData, setActiveTemplateData] = useState({});
  const [selectedUser, setSelectedUser] = useState('');
  const [user_list, setUserList] = useState([]);
  const [checkedBoxes, setCheckedBoxes] = useState([]);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    setActiveTemplateData(availabilityData.temp_dict);
}, [availabilityData]);

  useEffect(() => {
    const fetchAvailabilityData = async () => {
      setIsLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/availability?week_adjustment=${weekAdjustment}&selectedUser=${encodeURIComponent(selectedUser)}`, {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setAvailabilityData(response.data);
          setUserList(response.data.user_list);
          setIsLoading(false);
          console.log(response)
        } catch (error) {
          console.error('Error fetching availability details:', error);
          setIsLoading(false);
        }
    };

    fetchAvailabilityData();
}, [weekAdjustment, token, selectedUser]);

useEffect(() => {
  if (availabilityData.temp_dict) {
    const timesForFirstDay = [
      availabilityData.temp_dict['1&2'],
      availabilityData.temp_dict['1&3'],
      availabilityData.temp_dict['1&4'],
      availabilityData.temp_dict['1&5'],
    ];
    const nonZeroTimes = timesForFirstDay.filter(time => time && time !== '00:00');
    setAdditionalTimes(nonZeroTimes.length / 2);
  }
}, [availabilityData]);

  const hourDivider = availabilityData.hourDivider;
  const step = 3600 / hourDivider;


  const handleAddTime = () => {
    if (additionalTimes < 1) {
      setAdditionalTimes(additionalTimes + 1);
    }
  };
  
  const goToNextWeek = () => {
    setWeekAdjustment(weekAdjustment + 7);
  };

  const goToPreviousWeek = () => {
    setWeekAdjustment(weekAdjustment - 7);
  };

  const isUserEmpty = selectedUser === null || selectedUser === undefined || selectedUser === '';

  const handleCheckboxChange = (index, isChecked) => {
    let updatedBoxes = [...checkedBoxes];

    if (isChecked) {
        updatedBoxes.push(index);
    } else {
        updatedBoxes = updatedBoxes.filter(item => item !== index);
    }

    setCheckedBoxes(updatedBoxes);
  };
  

  const handleFormSubmit = async (values, buttonName) => {

    Object.keys(values).forEach(key => {
      // Check if the key is a time field
      if (key.startsWith('day_') && values[key] === '') {
          // Set the value to None if the field is empty
          values[key] = undefined;
      }
    });

    const payload = { ...values, button: buttonName, selectedTemplate, selectedUser, checkedBoxes };
    console.log("Final payload before sending to server:", payload);

    try {
      // Send the updated form values to the server for database update
      await axios.post(`${API_BASE_URL}/api/availability?week_adjustment=${weekAdjustment}&selectedUser=${encodeURIComponent(selectedUser)}`, payload, {
    headers: {
        'Authorization': `Bearer ${token}`
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating availability details:', error);
      setShowErrorNotification(true);
    }
  };
  if (isLoading) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" height="100vh">
        <ThreeDots type="ThreeDots" color="#70D8BD" height={80} width={80} />
      </Box>
    );
  }

  const fetchTemplate1Data = () => {
    setActiveTemplateData(availabilityData.template1_dict);
  };
  
  const fetchTemplate2Data = () => {
    setActiveTemplateData(availabilityData.template2_dict);
  };
  
  const fetchTemplate3Data = () => {
    setActiveTemplateData(availabilityData.template3_dict);
  };

  

  return (
    <Box m="20px">
      <Header
        title={t('availabilty.title')}
        subtitle={t('availabilty.subtitle')}
      />

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{
          ...Array.from({ length: availabilityData.day_num || 0 }).reduce((acc, _, rowIndex) => {
            acc[`checkbox_${rowIndex}`] = activeTemplateData ? activeTemplateData[`checkBox${rowIndex + 1}`] === "X" : false;
            acc[`day_${rowIndex}_0`] = activeTemplateData && activeTemplateData[`${rowIndex + 1}&0`];
            acc[`day_${rowIndex}_1`] = activeTemplateData && activeTemplateData[`${rowIndex + 1}&1`];
            acc[`day_${rowIndex}_2`] = activeTemplateData && activeTemplateData[`${rowIndex + 1}&2`];
            acc[`day_${rowIndex}_3`] = activeTemplateData && activeTemplateData[`${rowIndex + 1}&3`];
            acc[`day_${rowIndex}_4`] = activeTemplateData && activeTemplateData[`${rowIndex + 1}&4`];
            acc[`day_${rowIndex}_5`] = activeTemplateData && activeTemplateData[`${rowIndex + 1}&5`];
            return acc;
          }, {}),
        }}
        validationSchema={checkoutSchema}
       /*  validate={values => {
          const errors = {};
          for (let i = 0; i < availabilityData.day_num; i++) {
            const end_time1 = values[`day_${i}_1`];
            const start_time2 = values[`day_${i}_2`];
            if (start_time2 <= end_time1) {
              errors[`day_${i}_2`] = 'Start Zeit 2 muss grösser als Endzeit 1 sein';
            }
          }
          return errors;
        }} */
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          setFieldValue,
        }) => (
          <form onSubmit={handleSubmit}>
            
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', marginBottom: '1rem' }}>
            <FormControl fullWidth variant="filled" sx={{ width: '250px' }}>
              <InputLabel id="user-label">{t('availabilty.user')}</InputLabel>
              <Select
                labelId="user-label"
                id="user"
                name="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                inputProps={{ maxLength: 30 }}
                sx={{
                  color: "black",
                  marginRight: '0.2rem',
                  height: '40px', // explicitly set height
                  '.MuiInputBase-root': {
                    height: '20px', // explicitly set input field height
                    fontSize: '10px' // explicitly set font size
                  },
                  '.MuiSelect-icon': { // Change color of icon to black
                    color: 'black',
                  }, 
                }}
              >
                <MenuItem value="">{t('availabilty.userselect')}</MenuItem>
                {user_list.map((user) => (
                  <MenuItem key={user} value={user}>
                    {user}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: '1rem' }}>
            <IconButton 
              onClick={goToPreviousWeek} 
              style={BUTTON_STYLE}>
              <ChevronLeft style={{ color: '#2E2E2E' }} />
            </IconButton>
            <Typography variant="h5" sx={{margin: '0 1rem'}}>
              {
                new Intl.DateTimeFormat('de', { 
                  weekday: 'short', 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric'
                }).format(new Date(availabilityData.week_start))
              }
            </Typography>
            <IconButton 
              onClick={goToNextWeek} 
              style={BUTTON_STYLE}>
              <ChevronRight style={{ color: '#2E2E2E' }}/>
            </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', marginBottom: '1rem' }}>
              <Button 
                variant="outlined"
                color="inherit"
                size="small"
                onClick={fetchTemplate1Data}
                sx={{
                  marginRight: '0.2rem',
                  borderColor: 'black',
                  height: '20px',
                  minHeight: '20px',
                  fontSize: '10px',
                  '&.MuiButtonOutlined': {
                    borderColor: 'black',
                  },
                  '&:hover': {
                    borderColor: 'white',
                  },
                  '&.MuiButtonText': {
                    borderColor: 'white',
                    color: 'white',
                    backgroundColor: '#2e7c67',
                  }
                }}
              >
                {t('availabilty.template1')}
              </Button>
              <Button 
                variant="outlined"
                color="inherit"
                size="small"
                onClick={fetchTemplate2Data}
                sx={{
                  marginRight: '0.2rem',
                  borderColor: 'black',
                  height: '20px',
                  minHeight: '20px',
                  fontSize: '10px',
                  '&.MuiButtonOutlined': {
                    borderColor: 'black',
                  },
                  '&:hover': {
                    borderColor: 'white',
                  },
                  '&.MuiButtonText': {
                    borderColor: 'white',
                    color: 'white',
                    backgroundColor: '#2e7c67',
                  }
                }}
              >
                {t('availabilty.template2')}
              </Button>
              <Button 
                variant="outlined"
                color="inherit"
                size="small"
                onClick={fetchTemplate3Data}
                sx={{
                  marginRight: '0.2rem',
                  borderColor: 'black',
                  height: '20px',
                  minHeight: '20px',
                  fontSize: '10px',
                  '&.MuiButtonOutlined': {
                    borderColor: 'black',
                  },
                  '&:hover': {
                    borderColor: 'white',
                  },
                  '&.MuiButtonText': {
                    borderColor: 'white',
                    color: 'white',
                    backgroundColor: '#2e7c67',
                  }
                }}
              >
                {t('availabilty.template3')}
              </Button>
              <Tooltip
                title={
                  <div style={{ fontSize: '15px' }}> 
                    <span style={{ ontSize: '10px' }}>Speicher deine Vorlage</span><br /><br />
                    1. Trage deine Verfügbarkeiten unten ein<br />
                    2. Wähle einen Vorlagenamen aus der Drop-Down Liste<br />
                    3. Speicher deine Vorlage über den Save Template Knopf
                  </div>
                }
                sx={{
                  '& .MuiTooltip-tooltip': {
                    padding: '10px', 
                  }
                }}
              >
                <InfoOutlinedIcon style={{ color: 'black' }} />
              </Tooltip>

              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', width: '100%', marginBottom: '1rem' }}>
        <Button 
              variant="outlined"
              color="inherit"
              size="small"
              onClick={() => handleFormSubmit(values, "Save Template")}
              sx={{
                marginRight: '0.2rem',
                borderColor: 'white',
                height: '20px',
                minHeight: '20px',
                fontSize: '10px',
                '&.MuiButtonOutlined': {
                  borderColor: 'white',
                },
                '&:hover': {
                  borderColor: 'white',
                },
                '&.MuiButtonText': {
                  borderColor: 'white',
                  color: 'white',
                  backgroundColor: '#2e7c67',
                }
              }}
            >
              {t('availabilty.savetemplate')}
            </Button>
            <Select 
                type="text"
                size="small"
                name="template_name"
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                inputProps={{ maxLength: 30 }}
                sx={{
                  marginRight: '0.2rem',
                  height: '20px', // explicitly set height
                  '.MuiInputBase-root': {
                    height: '20px', // explicitly set input field height
                    fontSize: '10px' // explicitly set font size
                  },
                  '.MuiSelect-icon': { // Change color of icon to black
                    color: 'black',
                },
                  
                }}
              >
                <MenuItem value={ 'Template 1' }>{t('availabilty.template1')}</MenuItem>
                <MenuItem value={ 'Template 2' }>{t('availabilty.template2')}</MenuItem>
                <MenuItem value={ 'Template 3' }>{t('availabilty.template3')}</MenuItem>
                </Select>
        </Box>
            <Box
      display="grid"
      gap="30px"
      gridTemplateColumns="repeat(7, minmax(0, 1fr))"
      sx={{
        "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          gridColumn: "span 1",
          display: "flex",
          alignItems: "center",
          height: "100%",
          justifyContent: "center",
        }}
      >
        {t('availabilty.weekday')}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          gridColumn: "span 1",
          display: "flex",
          alignItems: "center",
          height: "100%",
          justifyContent: "center",
        }}
      >
        {t('availabilty.holiday')}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          gridColumn: "span 1",
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        {t('availabilty.startime1')}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          gridColumn: "span 1",
          display: "flex",
          alignItems: "center",
          height: "100%",
        }}
      >
        {t('availabilty.endtime1')}
      </Typography>
      {additionalTimes >= 1 && (
        <>
          <Typography
            variant="h6"
            sx={{
              gridColumn: "span 1",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            {t('availabilty.startime2')}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              gridColumn: "span 1",
              display: "flex",
              alignItems: "center",
              height: "100%",
            }}
          >
            {t('availabilty.endtime2')}
          </Typography>
        </>
      )}
      
      {Array.from({ length: availabilityData.day_num }).map((_, rowIndex) => (
        <Box
          display="grid"
          gridTemplateColumns="repeat(7, minmax(0, 1fr))"
          gap="10px"  
          sx={{ gridColumn: "span 7" }}
        >
          <Typography
            key={`number-${rowIndex}`}
            color={colors.primary[100]}
            variant=""
            sx={{
              gridColumn: "span 1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // Center the text horizontally
              height: "100%",
              padding: "0 8px", // Add padding to the sides of the text
              backgroundColor: "#f0f0f0", // You can set a light background color to distinguish it from other elements
            }}
          >
            {availabilityData && availabilityData.weekdays
              ? availabilityData.weekdays[rowIndex]
              : ""}
          </Typography>
          <Checkbox
            name={`checkbox_${rowIndex}`}
            checked={values[`checkbox_${rowIndex}`]}
            onChange={(e) => {
              setFieldValue(`checkbox_${rowIndex}`, e.target.checked); // Directly use setFieldValue
              handleCheckboxChange(setFieldValue, `checkbox_${rowIndex}`, e.target.checked);
          }}
            disableRipple
            sx={{ 
              gridColumn: "span 1", 
              color: "black"
            }}
          />
          {Array.from({ length: 2 + additionalTimes * 2 }).map((_, columnIndex) => (
            <TextField
              key={`day_${rowIndex}_${columnIndex}`}
              fullWidth
              variant="filled"
              type="time"
              inputProps={{ step }}
              onBlur={handleBlur}
              onChange={handleChange}
              value={values[`day_${rowIndex}_${columnIndex}`]}
              name={`day_${rowIndex}_${columnIndex}`}
              error={
                !!touched[`day_${rowIndex}_${columnIndex}`] &&
                !!errors[`day_${rowIndex}_${columnIndex}`]
              }
              helperText={
                touched[`day_${rowIndex}_${columnIndex}`] &&
                errors[`day_${rowIndex}_${columnIndex}`]
              }
              sx={{
                gridColumn: "span 1",
                '& .MuiFilledInput-input': {
                  paddingTop: '10px',
                  paddingBottom: '10px',
                },
              }}
            />
          ))}
        </Box>
      ))}
    </Box>
            <Box display="flex" justifyContent="end" mt="20px">
            <Button onClick={handleAddTime} color="primary" variant="contained" sx={{ marginRight: '10px' }}>
            {t('availabilty.addtime')}
            </Button>
            <Button 
            variant="outlined"
            color="inherit"
            onClick={() => handleFormSubmit(values, "Submit")}
            sx={{
              borderColor: 'white',
              '&.MuiButtonOutlined': {
                borderColor: 'white',
              },
              '&:hover': {
                borderColor: 'white',
              },
              '&.MuiButtonText': {
                borderColor: 'white',
                color: 'white',
                backgroundColor: '#2e7c67',
              }
            }}
          >
            {t('availabilty.submit')}
          </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Snackbar
          open={showSuccessNotification}
          onClose={() => setShowSuccessNotification(false)}
          autoHideDuration={3000}
          ContentProps={{
              sx: {
                  backgroundColor: "green !important",
                  color: "white",
              }
          }}
      >
          <Alert onClose={() => setShowSuccessNotification(false)} severity="success" sx={{ width: '100%' }}>
            {t('availabilty.success')}
          </Alert>
      </Snackbar>
      <Snackbar
        open={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        autoHideDuration={3000}
        ContentProps={{
            sx: {
                backgroundColor: "red !important",
                color: "white",
            }
        }}
    >
        <Alert onClose={() => setShowErrorNotification(false)} severity="error" sx={{ width: '100%' }}>
          {t('availabilty.nosuccess')}
        </Alert>
    </Snackbar>

    </Box>
  );

};

const checkoutSchema = yup.object().shape({
  company_name: yup.string(),
  weekly_hours: yup.number(),
  shifts: yup.number(),
});

export default Availability;