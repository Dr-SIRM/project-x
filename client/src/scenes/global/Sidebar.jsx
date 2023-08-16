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
import axios from 'axios';


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


  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
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
                <Typography variant="h4" color={colors.grey[100]}>
                  TimeTab
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>
          {/* USER */}
          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <img
                  alt="TimeTab-Logo"
                  width="80px"
                  height="80px"
                  src={`../../assets/TimeTab.png`}
                  style={{ cursor: "pointer", borderRadius: "20%" }}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h3"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user.firstName}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
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
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />
            <Item
              title="Solver Req"
              to="/solver/requirement"
              icon={<HomeOutlinedIcon />}
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
              Team
            </Typography>
            <Item
              title="Manage Team"
              to="/team"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />
            <Item
              title="Einladen"
              to="/invite"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin", "Admin"]}
              accessLevel={user.accessLevel}
            />
            <Item
              title="Updaten"
              to="/update"
              icon={<PeopleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Seiten
            </Typography>
            <Item
              title="Neuer User"
              to="/form"
              icon={<PersonOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
              requiredAccessLevel={["Super_Admin"]}
              accessLevel={user.accessLevel}
            />
            <Item
              title="Verfügbarkeit"
              to="/availability"
              icon={<BusinessIcon />}
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
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Planung2"
              to="/planning2"
              icon={<CalendarTodayOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Schichtplan"
              to="/plan"
              icon={<CalendarTodayOutlinedIcon />}
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
              Charts
            </Typography>
            <Item
              title="Bar Chart"
              to="/bar"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to="/pie"
              icon={<PieChartOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to="/line"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Geography Chart"
              to="/geography"
              icon={<MapOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
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
