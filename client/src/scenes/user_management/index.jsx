// src/UserManagement.js
import React, { useState } from 'react';
import { List, ListItem, ListItemText, Typography, Container, Grid, Box, useTheme } from '@mui/material';
import Header from "../../components/Header";
import { tokens } from "../../theme";


const users = [
  { id: 1, name: 'User 1', details: 'Details about User 1' },
  { id: 2, name: 'User 2', details: 'Details about User 2' },
  { id: 3, name: 'User 3', details: 'Details about User 3' },
  { id: 4, name: 'User 4', details: 'Details about User 4' },
  // ... More users
];

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box sx={{ p: 3 }}>
      <Header title="User Management " subtitle="Siehe die Mitarbeiter Details" />
      <Grid container spacing={4}>
        <Grid item xs={12} sm={4}>
          <Typography variant="h5" gutterBottom>
            Mitarbeiter Liste
          </Typography>
          <List>
            {users.map((user) => (
              <ListItem button key={user.id} onClick={() => setSelectedUser(user)}>
                <ListItemText 
                  primary={user.name} 
                  sx={{ '&:hover': {
                    backgroundColor: '#f0f0f0', // or any color you prefer
                  },
                   color: 'black' }} // Here, enforcing the color to be black
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} sm={8}>
          <Typography variant="h5" gutterBottom>
            Mitarbeiter Details
          </Typography>
          {selectedUser ? (
            <Typography sx={{ color: 'black' }} variant="body1">
              {selectedUser.details}
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
