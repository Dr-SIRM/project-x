import React, { useEffect, useState, useRef  } from 'react';
import { Box, Typography, useTheme, Select, MenuItem } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button } from '@mui/material';
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Header from "../../components/Header";
import { ThreeDots } from "react-loader-spinner"; 
import axios from "axios";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { API_BASE_URL } from "../../config";
import { useTranslation } from 'react-i18next';
import '../../i18n';  


const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('session_token'); 
  //const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        setUsers(response.data.users);
        setDepartments(response.data.departments);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching update details:', error);
        setIsLoading(false);
      }
    };
  
    fetchUser();
  }, []);
  
  const editingCellIdRef = useRef(null);  // Create a ref to store the id of the cell being edited

  const handleCellEditStart = (params) => {
    editingCellIdRef.current = params.id;  // Store the id of the cell being edited
  };

  const handleCellEditStop = async (params) => {
    const id = params.id;
    const field = params.field;

    // Retrieve the new value from the DOM
    const inputElement = document.querySelector(`[data-id='${id}'] input`);
    console.log('Input Element:', inputElement);
    if (inputElement) {
        const newValue = inputElement.value;

        console.log('New value:', newValue);  // Log the new value to the console for debugging

        // Prepare the data to be sent to the server
        let sendData = {[field]: newValue};

        // Check if the edited field is 'employment_level' and modify the data accordingly
          if (field === 'employment_level') {
            sendData[field] = parseFloat(newValue);  
          }


        try {
            // Send the modified data to the server
            await axios.put(`${API_BASE_URL}/api/users/update/${id}`, sendData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Re-fetch the data from the server
            const response = await axios.get(`${API_BASE_URL}/api/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            console.log('Server Response:', response);
            setUsers(response.data.users);  // Update the users state with the fresh data from the server

        } catch (error) {
            console.error('Error updating user:', error);
        }
    } else {
        console.error('Could not find input element for edited cell');
    }
};

const handleEmploymentLevelChange = async (event, id) => {
  const newValue = event.target.value 

  try {
      // Send the modified data to the server
      await axios.put(`${API_BASE_URL}/api/users/update/${id}`, { employment_level: newValue }, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      // Re-fetch the data from the server
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      setUsers(response.data.users);  // Update the users state with the fresh data from the server

  } catch (error) {
      console.error('Error updating user:', error);
  }
};

const handleEmploymentChange = async (event, id) => {
  const newValue = event.target.value === "Vollzeit" ? "Perm" : "Temp";
  console.log(event.target.value, newValue)

  try {
    // Send the modified data to the server
    await axios.put(`${API_BASE_URL}/api/users/update/${id}`, { employment: newValue }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Re-fetch the data from the server
    const response = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setUsers(response.data.users);  // Update the users state with the fresh data from the server
  } catch (error) {
    console.error('Error updating user:', error);
  }
};

const handleDepartmentChange = async (event, id) => {
  const newValue = event.target.value;

  try {
      // Send the modified data to the server
      await axios.put(`${API_BASE_URL}/api/users/update/${id}`, { department: newValue }, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      // Re-fetch the data from the server
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      setUsers(response.data.users);  // Update the users state with the fresh data from the server

  } catch (error) {
      console.error('Error updating user:', error);
  }
};

const handleDepartment2Change = async (event, id) => {
  const newValue = event.target.value;

  try {
    // Send the modified data to the server
    await axios.put(`${API_BASE_URL}/api/users/update/${id}`, { department2: newValue }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Re-fetch the data from the server
    const response = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setUsers(response.data.users);  // Update the users state with the fresh data from the server
  } catch (error) {
    console.error('Error updating user:', error);
  }
};
const handleDepartment3Change = async (event, id) => {
  const newValue = event.target.value;

  try {
    // Send the modified data to the server
    await axios.put(`${API_BASE_URL}/api/users/update/${id}`, { department3: newValue }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Re-fetch the data from the server
    const response = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setUsers(response.data.users);  // Update the users state with the fresh data from the server
  } catch (error) {
    console.error('Error updating user:', error);
  }
};


const [openDialog, setOpenDialog] = useState(false);
const [userIdToDelete, setUserIdToDelete] = useState(null);

const handleDialogOpen = (id) => {
  setUserIdToDelete(id);
  setOpenDialog(true);
};

const handleDialogClose = () => {
  setOpenDialog(false);
};

const handleConfirmDelete = async () => {
  setOpenDialog(false);
  if (userIdToDelete) {
    await handleDeleteUser(userIdToDelete);
    setUserIdToDelete(null);
  }
};

  const handleDeleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/users/delete/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      // Filter out the user from the current state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };


  if (isLoading) {
    return (
      <Box m="20px" display="flex" justifyContent="center" alignItems="center" height="100vh">
        <ThreeDots type="ThreeDots" color="#70D8BD" height={80} width={80} />
      </Box>
    );
  }
  

  const columns = [
    {
      field: "first_name",
      headerName: t('team.columns.first_name'),
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
    },
    {
      field: "last_name",
      headerName: t('team.columns.last_name'),
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true
    },
    {
      field: "email",
      headerName: t('team.columns.email'),
      flex: 1,
      editable: true,
    },
    {
      field: "employment",
      headerName: t('team.columns.employment'),
      flex: 1,
      editable: false,
      renderCell: (params) => (
        <Select
          value={params.value === "Perm" ? "Vollzeit" : "Teilzeit"}
          onChange={(event) => handleEmploymentChange(event, params.id)}
          icon={<ArrowDropDownIcon sx={{ color: 'black' }} />}
          sx={{
            width: '100%',
            backgroundColor: 'white !important',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          <MenuItem value="Vollzeit">Vollzeit</MenuItem>
          <MenuItem value="Teilzeit">Teilzeit</MenuItem>
        </Select>
      ),
    },  
    {
      field: "employment_level",
      headerName: t('team.columns.employment_level'),
      flex: 1,
      editable: false,
      renderCell: (params) => (
        <Select
          value={params.value * 100}
          onChange={(event) => handleEmploymentLevelChange(event, params.id)}
          sx={{
            width: '100%',
            border: 'none',
            backgroundColor: 'white !important',  
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((value) => (
            <MenuItem key={value} value={value}>
              {value}%
            </MenuItem>
          ))}
        </Select>
      ),
      valueFormatter: (params) => {
        const employment_level = params.value;
        const isValidNumber = !isNaN(employment_level);
        const modifiedValue = isValidNumber ? `${employment_level * 100}%` : "";
        return modifiedValue;
      },
    },

    {
      field: "department",
      headerName: t('team.columns.department'),
      flex: 1.2,
      editable: false,
      renderCell: (params) => (
        <Select
          value={params.value}  // this will be the current department for the user from the backend
          onChange={(event) => handleDepartmentChange(event, params.id)}
          sx={{
            width: '100%',
            backgroundColor: 'white !important',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          <MenuItem value="">---</MenuItem>
          {departments.map((department) => (
            <MenuItem key={department} value={department}>
              {department}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: "department2",
      headerName: t('team.columns.department2'),
      flex: 1.2,
      editable: false,
      renderCell: (params) => (
        <Select
          value={params.value}  // this will be the current department2 for the user from the backend
          onChange={(event) => handleDepartment2Change(event, params.id)}
          sx={{
            width: '100%',
            backgroundColor: 'white !important',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          <MenuItem value="">---</MenuItem>
          {departments.map((department) => (
            <MenuItem key={department} value={department}>
              {department}
            </MenuItem>
          ))}
        </Select>
      ),
    },
    {
      field: "department3",
      headerName: t('team.columns.department3'),
      flex: 1.2,
      editable: false,
      renderCell: (params) => (
        <Select
          value={params.value}  // this will be the current department2 for the user from the backend
          onChange={(event) => handleDepartment3Change(event, params.id)}
          sx={{
            width: '100%',
            backgroundColor: 'white !important',
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
          }}
        >
          <MenuItem value="">---</MenuItem>
          {departments.map((department) => (
            <MenuItem key={department} value={department}>
              {department}
            </MenuItem>
          ))}
        </Select>
      ),
    },

    {
      field: "access_level",
      headerName: t('team.columns.access_level'),
      flex: 1,
      renderCell: ({ row: { access_level } }) => {
        return (
          <Box
            width="60%"
            m="0 auto"
            p="5px"
            display="flex"
            justifyContent="center"
            backgroundColor={
              access_level === "admin"
                ? colors.greenAccent[600]
                : access_level === "manager"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {access_level === "admin" && <AdminPanelSettingsOutlinedIcon />}
            {access_level === "manager" && <SecurityOutlinedIcon />}
            {access_level === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {access_level}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'delete',
      headerName: 'Delete',
      sortable: false,
      renderCell: (params) => (
        <DeleteOutlineIcon
          onClick={() => handleDialogOpen(params.id)}
          sx={{
            cursor: 'pointer',
            color: 'error.main',
            '&:hover': {
              color: 'error.dark',
            },
          }}
        />
      ),
      width: 100,
      align: 'center',
    },
    
  ];

  return (
    <Box m="20px">
      <Header title={t('team.title')} subtitle={t('team.subtitle')} />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid black",
            color: colors.primary[100],
            backgroundColor: colors.grey[900],
            borderBottom: "none",    
          },
          "& .name-column--cell": {
            color: colors.primary[100],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.primary[100],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.grey[900],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.primary[100],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
        
      >
        <Dialog
          open={openDialog}
          onClose={handleDialogClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this user?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="primary" autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>        
        <DataGrid        
        rows={users}
        columns={columns}
        onCellEditStart={handleCellEditStart}  // Set the onCellEditStart prop
        onCellEditStop={handleCellEditStop}   // Adjusted to call your function
        onCellClick={(params) => console.log('Cell clicked', params)}
      />
      </Box>
    </Box>
  );
};

export default Team;
