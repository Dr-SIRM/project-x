import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  Typography,
  Grid,
  Box,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StatBox from "../../components/StatBox";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { API_BASE_URL } from "../../config";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "../../i18n";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [scheduledShifts, setScheduledShifts] = useState([]);
  const token = localStorage.getItem("session_token");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t, i18n } = useTranslation();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/user_management`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUsers(response.data.users);
        setIsLoading(false);
      } catch (error) {
        // console.error("Error fetching update details:", error);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  //GET Availabilty DATA
  const fetchAvailability = async (email) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/user_availability/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAvailability(response.data.availability);
      const availabilityWithId = response.data.availability.map((item, index) => ({
        ...item,
        id: `${item.date}-${index}`  // Creating a unique identifier
      }));
      setAvailability(availabilityWithId);
    } catch (error) {
      // console.error("Error fetching availability:", error);
    }
  };

  //GET Shift DATA (backend not programmed yet)
  const fetchScheduledShifts = async (email) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/user_scheduled_shifts/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setScheduledShifts(response.data.scheduledShifts);
    } catch (error) {
      // console.error("Error fetching scheduled shifts:", error);
    }
  };
  

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchAvailability(user.email); // passing email instead of user.id
    fetchScheduledShifts(user.email);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Header title={t("UserManagement")} subtitle={t("SeeEmployeeDetails")} />
      <Grid container spacing={4}>
        {/* Employee List */}
        <Grid item xs={12} sm={2}>
          <Typography variant="h5" gutterBottom>
            {t("EmployeeList")}
          </Typography>
          <Box
            backgroundColor={colors.grey[900]}
            borderRadius="15px"
            p={0}
            width="fit-content"
          >
            <List>
              {users.map((user) => (
                <ListItem
                  button
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                >
                  <Chip
                    avatar={
                      <Avatar>{`${user.first_name.charAt(
                        0
                      )}${user.last_name.charAt(0)}`}</Avatar>
                    }
                    label={
                      <Typography
                        variant="body1"
                        component="div"
                        sx={{ fontSize: "1rem" }}
                      >
                        {`${user.first_name} ${user.last_name}`}
                      </Typography>
                    }
                    sx={{
                      "&:hover": { backgroundColor: "#f0f0f0" },
                      color: "black",
                      backgroundColor:
                        selectedUser && selectedUser.id === user.id
                          ? "#22E3B6"
                          : "transparent",
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>
  
        {/* Stat Boxes, Availability, and Scheduled Shifts */}
        <Grid item xs={12} sm={10}>
          <Grid container spacing={2}>
            {/* Stat Boxes */}
            <Grid item xs={12} sm={3}>
            <Box
              sx={{
                position: 'relative',
                width: '180px', // Set a fixed size for a square shape
                height: '120px',
                backgroundColor: theme.palette.primary.main,
                borderRadius: theme.shape.borderRadius,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[4],
              }}
            >
              {/* Hour Icon */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
              >
                <AccessTimeIcon />
              </Box>

              {/* Number and Text */}
              <Typography variant="title">Stunden der letzten 4 Wochen</Typography>
              <Typography variant="subtitle1">160 </Typography>
            </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
            <Box
              sx={{
                position: 'relative',
                width: '180px', // Set a fixed size for a square shape
                height: '120px',
                backgroundColor: theme.palette.primary.main,
                borderRadius: theme.shape.borderRadius,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[4],
              }}
            >
              {/* Hour Icon */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                }}
              >
                <AccessTimeIcon />
              </Box>

              {/* Number and Text */}
              <Typography variant="title">Eingeplante Stunden</Typography>
              <Typography variant="subtitle1">12</Typography>
            </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box
                  gridColumn={isMobile ? "span 12" : "span 3"}
                  backgroundColor={colors.primary[800]}
                  borderRadius="15px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
              </Box>
            </Grid>
  
            {/* Availability Grid */}
            <Grid item xs={12} sm={6}>
              <Typography variant="h5" gutterBottom>
                {t("Availability")}
              </Typography>
          <Box
            mt="10px"
            borderRadius="15px"
            height="75vh"
            style={{ backgroundColor: "white" }}
            sx={{
              "& .MuiDataGrid-root": {
                borderColor: "black",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid black",
                borderTop: "1px solid black",
                color: colors.primary[100],
                backgroundColor: colors.grey[900],
                "&:focus": {
                  outline: "none",
                  borderWidth: "1px",
                  borderColor: "black",
                },
                "&:focus-within": {
                  outline: "none",
                  borderWidth: "1px",
                  borderColor: "black",
                },
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: colors.grey[500],
                color: "white",
                borderColor: "black",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.grey[900],
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: colors.grey[500],
              },
              "& .MuiCheckbox-root": {
                color: `${colors.greenAccent[200]} !important`,
              },
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                outline: "none",
                borderLeft: "none",
                borderRight: "none",
              },
              "& .MuiDataGrid-row:focus-within, & .MuiDataGrid-row:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                {
                  outline: "none",
                },
            }}
          >
            <DataGrid
              rows={availability}
              pageSize={10}
              rowsPerPageOptions={[5]}
              getRowId={(row) => row.id}
              columns={[
                { field: "date", headerName: t("date"), flex: 1 },
                { field: "weekday", headerName: t("weekday"), flex: 1 },
                { field: "start_time", headerName: t("startTime"), flex: 1 },
                { field: "end_time", headerName: t("endTime"), flex: 1 },
              ]}
            />
          </Box>
        </Grid>

        <Grid item xs={12} sm={5}>
          <Typography variant="h5" gutterBottom>
            {t("ScheduledShifts")}
          </Typography>
          <Box
            mt="10px"
            borderRadius="15px"
            height="75vh"
            style={{ backgroundColor: "white" }}
            sx={{
              "& .MuiDataGrid-root": {
                borderColor: "black",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid black",
                borderTop: "1px solid black",
                color: colors.primary[100],
                backgroundColor: colors.grey[900],
                "&:focus": {
                  outline: "none",
                  borderWidth: "1px",
                  borderColor: "black",
                },
                "&:focus-within": {
                  outline: "none",
                  borderWidth: "1px",
                  borderColor: "black",
                },
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: colors.grey[500],
                color: "white",
                borderColor: "black",
              },
              "& .MuiDataGrid-virtualScroller": {
                backgroundColor: colors.grey[900],
              },
              "& .MuiDataGrid-footerContainer": {
                borderTop: "none",
                backgroundColor: colors.grey[500],
              },
              "& .MuiCheckbox-root": {
                color: `${colors.greenAccent[200]} !important`,
              },
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                outline: "none",
                borderLeft: "none",
                borderRight: "none",
              },
              "& .MuiDataGrid-row:focus-within, & .MuiDataGrid-row:focus": {
                outline: "none",
              },
              "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within":
                {
                  outline: "none",
                },
            }}
          >
            <DataGrid
              rows={scheduledShifts}
              pageSize={5}
              rowsPerPageOptions={[5]}
              getRowId={(row) => row.id}
              columns={[
                { field: "date", headerName: t("date"), flex: 1 },
                { field: "weekday", headerName: t("weekday"), flex: 1 },
                { field: "start_time", headerName: t("startTime"), flex: 1 },
                { field: "end_time", headerName: t("endTime"), flex: 1 },
              ]}
            />
          </Box>
        </Grid>
        </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserManagement;
