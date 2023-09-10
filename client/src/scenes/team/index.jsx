import React, { useEffect, useState } from 'react';
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import Header from "../../components/Header";
import { ThreeDots } from "react-loader-spinner"; 
import axios from "axios";



const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('session_token'); 
  //const [userData, setUserData] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/api/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
  
        setUsers(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching update details:', error);
        setIsLoading(false);
      }
    };
  
    fetchUser();
  }, []);
  
    
  const handleEditRowsModelChange = async (params) => {
    console.log("handleEditRowsModelChange called", params);

    const id = params.model[0].id;
    const field = params.model[0].field;
    const newValue = params.model[0].value;

    // Prepare the data to be sent to the server
    let sendData = {[field]: newValue};

    // Check if the edited field is 'employment_level' and modify the data accordingly
    if (field === 'employment_level') {
        sendData[field] = newValue / 100;  // Convert percentage back to a value between 0 and 1
    }

    try {
        // Send the modified data to the server
        await axios.put(`http://localhost:5000/api/users/update/${id}`, sendData, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const updatedUsers = users.map(user => {
            if (user.id === id) {
                return { ...user, [field]: newValue };
            }
            return user;
        });
        setUsers(updatedUsers);
    } catch (error) {
        console.error('Error updating user:', error);
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
      headerName: "Vorname",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true,
    },
    {
      field: "last_name",
      headerName: "Nachname",
      flex: 1,
      cellClassName: "name-column--cell",
      editable: true
    },
    {
      field: "email",
      headerName: "E-mail",
      flex: 1,
      editable: true,
    },
    {
      field: "employment",
      headerName: "Anstellung",
      flex: 1,
      valueGetter: (params) => {
        const employment = params.row.employment;
        return employment === "Perm" ? "Vollzeit" : employment === "Temp" ? "Teilzeit" : employment;
      },
      editable: true,
    },  
    {
      field: "employment_level",
      headerName: "Anstellungsgrad",
      flex: 1,
      editable: true,
      valueFormatter: (params) => {
          const employment_level = params.value;
          const isValidNumber = !isNaN(employment_level);
          const modifiedValue = isValidNumber ? `${employment_level * 100}%` : "";
          return modifiedValue;
      },
      valueParser: (value) => {
          return parseFloat(value) / 100;
      },
  },
  
    {
      field: "department",
      headerName: "Abteilung",
      flex: 1,
      editable: true,
    },
    {
      field: "access_level",
      headerName: "Access Level",
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
  ];

  return (
    <Box m="20px">
      <Header title="TEAM" subtitle="Übersicht von den Team Mitglieder" />
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[800],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[800],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >        
        <DataGrid
          checkboxSelection
          rows={users}
          columns={columns}
          onEditCellChange={() => console.log('Edit cell change')}
          onCellClick={() => console.log('Cell clicked')}
      />

      </Box>
    </Box>
  );
};

export default Team;
