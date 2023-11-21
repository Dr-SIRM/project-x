import React, { useEffect, useState, useRef  } from 'react';
import { Box, Typography, useTheme, Select, MenuItem } from "@mui/material";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, InputLabel,OutlinedInput, Checkbox, FormControl, ListItemText } from '@mui/material';
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

  const DepartmentSelect = ({ departments, selectedDepartments, onDropdownClose, userId }) => {
    // Initialize local state with selectedDepartments
    const [tempSelectedDepartments, setTempSelectedDepartments] = useState(selectedDepartments);
  
    const handleChange = (event) => {
      setTempSelectedDepartments(event.target.value); // Update temp state
    };
  
    const handleClose = () => {
      onDropdownClose(tempSelectedDepartments, userId); // Call parent handler when dropdown is closed
    };
  
    useEffect(() => {
      setTempSelectedDepartments(selectedDepartments); // Sync with external changes
    }, [selectedDepartments]);
  
    return (
      <FormControl sx={{ m: 1, width: 300 }}>
        {!selectedDepartments.length && (
        <InputLabel id="department-select-label">Department</InputLabel>
        )}
        <Select
          labelId="department-select-label"
          id="department-multi-select"
          multiple
          value={tempSelectedDepartments}
          onChange={handleChange}
          onClose={handleClose}
          renderValue={(selected) => selected.join(', ')}
          MenuProps={{ PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: 250 } } }}
        >
          {departments.map((department) => (
            <MenuItem key={department} value={department}>
              <Checkbox checked={tempSelectedDepartments.indexOf(department) > -1} />
              <ListItemText primary={department} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  };

  const handleDepartmentDropdownClose = async (selectedDepartments, userId) => {
    const departmentData = {};

    selectedDepartments.forEach((dept, index) => {
    departmentData[`department${index + 1}`] = dept;
    });
    try {
      await axios.put(`${API_BASE_URL}/api/users/update/${userId}`, departmentData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      setUsers(prevUsers => prevUsers.map(user => user.id === userId ? { ...user, ...departmentData } : user));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getUserDepartments = (user) => {
    return [user.department, user.department2, user.department3].filter(Boolean);
  };

  const handleInTrainingChange = async (event, id) => {
    // Determine the new value for in_training based on the checkbox state
    const newValue = event.target.checked ? 'X' : 'None'; // Adjust this based on how your backend expects the data
  
    try {
      // Send the updated value to the server
      await axios.put(`${API_BASE_URL}/api/users/update/${id}`, { in_training: newValue }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      // Re-fetch the data from the server or update the state locally
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data.users); // Update the users state with the fresh data from the server
    } catch (error) {
      console.error('Error updating in_training status:', error);
    }
  };
  
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

const handleDepartmentChange = async (newValues, userId) => {
  try {
    await axios.put(`${API_BASE_URL}/api/users/update/${userId}`, { department: newValues }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    setUsers(prevUsers => prevUsers.map(user => 
      user.id === userId ? { ...user, departments: newValues } : user
    ));
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
      field: "departments",
      headerName: t('team.columns.department'),
      flex: 1.2,
      editable: false,
      renderCell: (params) => {
        const userDepartments = getUserDepartments(users.find(user => user.id === params.id));
        return (
          <DepartmentSelect
            departments={departments}
            selectedDepartments={userDepartments}
            onDropdownClose={handleDepartmentDropdownClose}
            userId={params.id}
          />
        );
      },
    },
    {
      field: "in_training",
      headerName: t('team.columns.in_training'),
      flex: 1,
      align: 'center', // Align the cell content to the center
      headerAlign: 'center', 
      renderCell: (params) => (
        <Checkbox
          checked={params.value === 'X' || params.value === true}
          onChange={(event) => handleInTrainingChange(event, params.id)}
          color="primary"
        />
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
      headerName: t('team.columns.delete'),
      headerAlign: 'center', 
      align: 'center', 
      sortable: false,
      renderCell: (params) => (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%', // Ensures the Box takes the full width of the cell
          }}
        >
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
        </Box>
      ),
      width: 100,
      align: 'center', // Centers the cell content
    }    
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
            color: `${colors.greenAccent[900]} !important`,
          },
        }}
        
      >
        <Dialog
          open={openDialog}
          onClose={handleDialogClose}

          PaperProps={{
            style: { backgroundColor: 'black', color: "red" }, // your desired background color here
          }}
        >
          <DialogTitle id="alert-dialog-title" style={{ color: '#FFFFFF', fontSize: "16px"}}>{t('team.deletion.confirm_delete')}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" style={{ color: '#FFFFFF'}}>
              {t('team.deletion.question')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              {t('team.deletion.cancel')}
            </Button>
            <Button onClick={handleConfirmDelete} color="primary" autoFocus>
              {t('team.deletion.confirm')}
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
