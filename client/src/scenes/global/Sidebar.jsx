import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import BusinessIcon from '@mui/icons-material/Business';
import CalculateIcon from '@mui/icons-material/Calculate';
import TuneIcon from '@mui/icons-material/Tune';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import GroupsIcon from '@mui/icons-material/Groups';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SettingsIcon from '@mui/icons-material/Settings';
import axios from 'axios';




const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const token = localStorage.getItem('session_token'); 
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    accessLevel: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5000/api/current_react_user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then((response) => {
        if (response.data) {
          const currentUser = response.data;
          setUser({
            firstName: currentUser.first_name,
            lastName: currentUser.last_name,
            companyName: currentUser.company_name,
            email: currentUser.email,
            accessLevel: currentUser.access_level
          });
        }
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
  }, []);

    const Item = ({ title, to, icon, selected, setSelected, requiredAccessLevel, accessLevel }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
  
    // Don't render the item if the user's access level is not included in the required access levels for the item
    if (Array.isArray(requiredAccessLevel) && !requiredAccessLevel.includes(accessLevel)) {
      return null;
    } else if (typeof requiredAccessLevel === 'string' && requiredAccessLevel !== accessLevel) {
      return null;
    }
    
    
    return (
      <MenuItem
        active={selected === title}
        style={{
          color: colors.grey[100],
        }}
        onClick={() => setSelected(title)}
        icon={icon}
      >
        <Typography>{title}</Typography>
        <Link to={to} />
      </MenuItem>
    );
  };

  const ConditionalTypography = ({ requiredAccessLevel, userAccessLevel, children, ...props }) => {
    if (Array.isArray(requiredAccessLevel) && !requiredAccessLevel.includes(userAccessLevel)) {
      return null; // Don't render anything if the user's access level is not in the requiredAccessLevel array
    }
    return <Typography {...props}>{children}</Typography>;
  };
  
  

  
  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[800]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#22E3B6 !important",
        },
        "& .pro-menu-item.active": {
          color: "#22E3B6 !important",
        },
      }}
      className="sidebar"
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="TimeTab-Logo"
                  width="120px"
                  height="50px"
                  src={`../../assets/TimeTab.png`}
                  style={{ cursor: "pointer", borderRadius: "20%" }}
                />
              </Box>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>
          {/* USER */}
          {!isCollapsed && (
            <Box mb="25px">
              <Box textAlign="center">
                <Typography
                  variant="h4"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="h6" color={colors.greenAccent[500]}>
                  {user.accessLevel}
                </Typography>
              </Box>
            </Box>
          )}
          {/* MENU ITEMS */}
          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Solver"
              to="/solver"
              icon={<CalculateIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />
            <Item
              title="Solver Req"
              to="/solver/requirement"
              icon={<TuneIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />

            <ConditionalTypography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              userAccessLevel={user.accessLevel} 
            >
              Team
            </ConditionalTypography>
            <Item
              title="Manage Team"
              to="/team"
              icon={<GroupsIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />
            <Item
              title="User Management"
              to="/user_management"
              icon={<GroupsIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />
            
            <Item
              title="Einladen"
              to="/invite"
              icon={<GroupAddIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Seiten
            </Typography>
            <Item
              title="Verfügbarkeit"
              to="/availability"
              icon={<EventAvailableIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Company"
              to="/company"
              icon={<BusinessIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />
            <Item
              title="Kalender"
              to="/calendar"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Planung"
              to="/planning"
              icon={<EventNoteIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />
            <Item
              title="Schichtplan"
              to="/plan"
              icon={<CalendarViewMonthIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="FAQ"
              to="/faq"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Account
            </Typography>
            <Item
              title="Einstellungen"
              to="/update"
              icon={<SettingsIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <ConditionalTypography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
              requiredAccessLevel={["Super_Admin"]}
              userAccessLevel={user.accessLevel} 
            >
              Sonstiges
            </ConditionalTypography>
            <Item
              title="Neuer User"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin"]}
              accessLevel={user.accessLevel}
            />
          </Box>
          {!isCollapsed && (
  <Box
    style={{
      paddingLeft: "50px", 
      paddingTop: "20px",
    }}
  >
    <Typography>
      <h5>© 2023 TimeTab GmbH</h5>
    </Typography>
  </Box>
)}


        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
