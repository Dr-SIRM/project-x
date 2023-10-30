import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  Typography,
  Grid,
  Box,
  Chip,
  Avatar,
  useTheme,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Header from '../../components/Header';
import { tokens } from '../../theme';
import { API_BASE_URL } from '../../config';
import axios from 'axios'; 
import { useTranslation } from 'react-i18next';
import '../../i18n';  // Import the i18n configuration
 

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const token = localStorage.getItem('session_token');
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t, i18n } = useTranslation();


  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user_management`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        setUsers(response.data.users);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching update details:', error);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

    const fetchAvailability = async (email) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user_availability/${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setAvailability(response.data.availability);
      } catch (error) {
        console.error('Error fetching availability:', error);
      }
  };

  const handleUserClick = (user) => {
      setSelectedUser(user);
      fetchAvailability(user.email);  // passing email instead of user.id
  };


  return (
    <Box sx={{ p: 3 }}>
      <Header title={t('UserManagement')} subtitle={t('SeeEmployeeDetails')} />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={2}>
          <Typography variant="h5" gutterBottom>
           {t('EmployeeList')}
          </Typography>
          <Box
            backgroundColor={colors.grey[900]}  // Change to your preferred color
            borderRadius="15px"
            p={0}  // Adjust padding as needed
            width="fit-content"  // Let the box fit its content
          >
            <List>
            {users.map((user) => (
              <ListItem button key={user.id} onClick={() => handleUserClick(user)}>
                <Chip
                  avatar={<Avatar>{`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}</Avatar>}
                  label={`${user.first_name} ${user.last_name}`}
                  sx={{ 
                    '&:hover': { backgroundColor: '#f0f0f0' }, 
                    color: 'black',
                    backgroundColor: selectedUser && selectedUser.id === user.id ? '#22E3B6' : 'transparent',  // Change 'blue' to any color you prefer
                  }}
                />
              </ListItem>
            ))}
          </List>
          </Box>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Typography variant="h5" gutterBottom>
            {t('Availability')}
          </Typography>
          <Box
            backgroundColor={colors.grey[900]}
            borderRadius="15px"
            p={2}  // Adjust padding as needed
            width="100%"  // Let the box take the full width of its grid item
          >
            <DataGrid
              style={{ color: "black" }}
              rows={availability}
              pageSize={5}
              rowsPerPageOptions={[5]}
              getRowId={(row) => row.weekday}
              hideFooterPagination
              hideFooter
              columns = {[
                { field: 'date', headerName: t('date'), flex: 1 },
                { field: 'weekday', headerName: t('weekday'), flex: 1 },
                { field: 'start_time', headerName: t('startTime'), flex: 1 },
                { field: 'end_time', headerName: t('endTime'), flex: 1 }
              ]}
            />
          </Box>
        </Grid>
        <Grid item xs={12} sm={5}>
          <Typography variant="h5" gutterBottom>
           {t('ScheduledShifts')}
          </Typography>
          <Box
            backgroundColor={colors.grey[900]}
            borderRadius="15px"
            p={2}  // Adjust padding as needed
            width="100%"  // Let the box take the full width of its grid item
          >
            <DataGrid
              style={{ color: "black" }}
              rows={availability}
              pageSize={5}
              rowsPerPageOptions={[5]}
              getRowId={(row) => row.weekday}  // or use any other unique value
              hideFooterPagination
              hideFooter
              columns = {[
                { field: 'date', headerName: t('date'), flex: 1 },
                { field: 'weekday', headerName: t('weekday'), flex: 1 },
                { field: 'start_time', headerName: t('startTime'), flex: 1 },
                { field: 'end_time', headerName: t('endTime'), flex: 1 }
              ]}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

};

export default UserManagement;
