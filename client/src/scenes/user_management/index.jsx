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
import Header from '../../components/Header';
import { tokens } from '../../theme';
import { API_BASE_URL } from '../../config';
import axios from 'axios';  

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem('session_token'); 

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

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

  return (
    <Box sx={{ p: 3 }}>
      <Header title="User Management " subtitle="Siehe die Mitarbeiter Details" />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}>
          <Typography variant="h5" gutterBottom>
            Mitarbeiter Liste
          </Typography>
          {/* Updated Box styling */}
          <Box
            backgroundColor={colors.grey[900]}  // Change to your preferred color
            borderRadius="15px"
            p={0}  // Adjust padding as needed
            width="fit-content"  // Let the box fit its content
          >
            <List>
              {users.map((user) => (
                <ListItem button key={user.id} onClick={() => setSelectedUser(user)}>
                  <Chip
                    avatar={<Avatar>{`${user.first_name.charAt(0)}${user.last_name.charAt(0)}`}</Avatar>}
                    label={`${user.first_name} ${user.last_name}`}
                    onClick={() => setSelectedUser(user)}
                    sx={{ '&:hover': { backgroundColor: '#f0f0f0' }, color: 'black' }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Typography variant="h5" gutterBottom>
            Mitarbeiter Details
          </Typography>
          {selectedUser ? (
            <Typography sx={{ color: 'black' }} variant="body1">
              {`${selectedUser.first_name} ${selectedUser.last_name}`}
            </Typography>
          ) : (
            <Typography variant="body1">
              Please select a user to view details.
            </Typography>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserManagement;
