import { useState, useEffect } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import BusinessIcon from "@mui/icons-material/Business";
import CalculateIcon from "@mui/icons-material/Calculate";
import TuneIcon from "@mui/icons-material/Tune";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import GroupsIcon from "@mui/icons-material/Groups";
import CalendarViewMonthIcon from "@mui/icons-material/CalendarViewMonth";
import EventNoteIcon from "@mui/icons-material/EventNote";
import SettingsIcon from "@mui/icons-material/Settings";
import useMediaQuery from "@mui/material/useMediaQuery";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";
import "../../i18n";
import "./side.css";
import MenuIcon from "@mui/icons-material/Menu";
import {
  AppBar,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  ListItemIcon,
} from "@mui/material";
import { Dashboard } from "@mui/icons-material";

const drawerWidth = 240;
const navItems = [
  "Dashboard",
  "Solver",
  "User Management" /* ... other items ... */,
];

const Sidebar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const token = localStorage.getItem("session_token");
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    accessLevel: "",
  });

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/current_react_user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.data) {
          const currentUser = response.data;
          setUser({
            firstName: currentUser.first_name,
            lastName: currentUser.last_name,
            companyName: currentUser.company_name,
            email: currentUser.email,
            accessLevel: currentUser.access_level,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching data: ", error);
      });
  }, []);

  const Item = ({
    title,
    to,
    icon,
    selected,
    setSelected,
    requiredAccessLevel,
    accessLevel,
  }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Don't render the item if the user's access level is not included in the required access levels for the item
    if (
      Array.isArray(requiredAccessLevel) &&
      !requiredAccessLevel.includes(accessLevel)
    ) {
      return null;
    } else if (
      typeof requiredAccessLevel === "string" &&
      requiredAccessLevel !== accessLevel
    ) {
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

  const ConditionalTypography = ({
    requiredAccessLevel,
    userAccessLevel,
    children,
    ...props
  }) => {
    if (
      Array.isArray(requiredAccessLevel) &&
      !requiredAccessLevel.includes(userAccessLevel)
    ) {
      return null; // Don't render anything if the user's access level is not in the requiredAccessLevel array
    }
    return <Typography {...props}>{children}</Typography>;
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      onClick={handleDrawerToggle}
      sx={{ textAlign: "center", color: "black" }}
    >
      <Typography variant="h6" sx={{ my: 2, color: "white" }}>
        {user.companyName || "Your Company Name"}
      </Typography>
      <Divider />
      <List>
        {/* Dashboard */}
        <ListItem
          button
          component={Link}
          to="/dashboard"
          selected={selected === "Dashboard"}
          onClick={() => setSelected("Dashboard")}
        >
          <ListItemIcon>
            <HomeOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary={t("sidebar.Dashboard")}
            sx={{ color: "white" }}
          />
        </ListItem>

        {/* Solver */}
        {["Super_Admin", "Admin"].includes(user.accessLevel) && (
          <ListItem
            button
            component={Link}
            to="/solver"
            selected={selected === "Solver"}
            onClick={() => setSelected("Solver")}
          >
            <ListItemIcon>
              <CalculateIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("sidebar.Solver")}
              sx={{ color: "white" }}
            />
          </ListItem>
        )}
        {/* Solver Requirement */}
        {["Super_Admin", "Admin"].includes(user.accessLevel) && (
          <ListItem
            button
            component={Link}
            to="/solver/requirement"
            selected={selected === "SolverReq"}
            onClick={() => setSelected("SolverReq")}
          >
            <ListItemIcon>
              <TuneIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("sidebar.Solver Req")}
              sx={{ color: "white" }}
            />
          </ListItem>
        )}
        {/* Manage Team */}
        {["Super_Admin", "Admin"].includes(user.accessLevel) && (
          <ListItem
            button
            component={Link}
            to="/team"
            selected={selected === "ManageTeam"}
            onClick={() => setSelected("ManageTeam")}
          >
            <ListItemIcon>
              <GroupsIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("sidebar.Manage Team")}
              sx={{ color: "white" }}
            />
          </ListItem>
        )}

        {/* User Management */}
        {["Super_Admin", "Admin"].includes(user.accessLevel) && (
          <ListItem
            button
            component={Link}
            to="/user_management"
            selected={selected === "UserManagement"}
            onClick={() => setSelected("UserManagement")}
          >
            <ListItemIcon>
              <PersonOutlinedIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("sidebar.User Management")}
              sx={{ color: "white" }}
            />
          </ListItem>
        )}
        {/* Availability */}
        {["Super_Admin", "Admin"].includes(user.accessLevel) && (
          <ListItem
            button
            component={Link}
            to="/availability"
            selected={selected === "Availability"}
            onClick={() => setSelected("Availability")}
          >
            <ListItemIcon>
              <EventAvailableIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("sidebar.Verfügbarkeit")}
              sx={{ color: "white" }}
            />
          </ListItem>
        )}

        {/* Calendar */}
        <ListItem
          button
          component={Link}
          to="/calendar"
          selected={selected === "Calendar"}
          onClick={() => setSelected("Calendar")}
        >
          <ListItemIcon>
            <CalendarTodayOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary={t("sidebar.Kalender")}
            sx={{ color: "white" }}
          />
        </ListItem>

        {/* Company */}
        {["Super_Admin", "Admin"].includes(user.accessLevel) && (
          <ListItem
            button
            component={Link}
            to="/company"
            selected={selected === "Company"}
            onClick={() => setSelected("Company")}
          >
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("sidebar.Company")}
              sx={{ color: "white" }}
            />
          </ListItem>
        )}

        {/* Planning */}
        {["Super_Admin", "Admin"].includes(user.accessLevel) && (
          <ListItem
            button
            component={Link}
            to="/planning"
            selected={selected === "Planning"}
            onClick={() => setSelected("Planning")}
          >
            <ListItemIcon>
              <EventNoteIcon />
            </ListItemIcon>
            <ListItemText
              primary={t("sidebar.Planung")}
              sx={{ color: "white" }}
            />
          </ListItem>
        )}

        {/* Shift Plan */}
        <ListItem
          button
          component={Link}
          to="/plan"
          selected={selected === "ShiftPlan"}
          onClick={() => setSelected("ShiftPlan")}
        >
          <ListItemIcon>
            <CalendarViewMonthIcon />
          </ListItemIcon>
          <ListItemText
            primary={t("sidebar.Schichtplan")}
            sx={{ color: "white" }}
          />
        </ListItem>

        {/* Settings */}
        <ListItem
          button
          component={Link}
          to="/update"
          selected={selected === "Settings"}
          onClick={() => setSelected("Settings")}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText
            primary={t("sidebar.Einstellungen")}
            sx={{ color: "white" }}
          />
        </ListItem>

        {/* FAQ */}
        <ListItem
          button
          component={Link}
          to="/faq"
          selected={selected === "FAQ"}
          onClick={() => setSelected("FAQ")}
        >
          <ListItemIcon>
            <HelpOutlineOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={t("sidebar.FAQ")} sx={{ color: "white" }} />
        </ListItem>
      </List>
    </Box>
  );

  // Render mobile view
  if (isMobile) {
    return (
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        {isMobile && (
          <>
            <AppBar
              position="fixed"
              sx={{
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: "transparent", // Set background to transparent
                boxShadow: "none", // Remove box shadow
                display: isMobile ? "block" : "none", // Ensure it's only for mobile view
              }}
            ></AppBar>
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{
                display: { xs: "block", sm: "none" },
                "& .MuiDrawer-paper": {
                  boxSizing: "border-box",
                  width: drawerWidth,
                },
              }}
            >
              {drawer}
            </Drawer>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              sx={{
                position: "fixed",
                bottom: 16,
                right: 16,
                backgroundColor: "primary.main",
                color: "white",
                zIndex: (theme) => theme.zIndex.drawer + 2,
              }}
            >
              <MenuIcon />
            </IconButton>
          </>
        )}
      </Box>
    );
  } else {
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
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
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
                title={t("sidebar.Dashboard")}
                to="/dashboard"
                icon={<HomeOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title={t("sidebar.Solver")}
                to="/solver"
                icon={<CalculateIcon />}
                selected={selected}
                setSelected={setSelected}
                requiredAccessLevel={["Super_Admin", "Admin"]}
                accessLevel={user.accessLevel}
              />
              <Item
                title={t("sidebar.Solver Req")}
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
                title={t("sidebar.Manage Team")}
                to="/team"
                icon={<GroupsIcon />}
                selected={selected}
                setSelected={setSelected}
                requiredAccessLevel={["Super_Admin", "Admin"]}
                accessLevel={user.accessLevel}
              />
              <Item
                title={t("sidebar.User Management")}
                to="/user_management"
                icon={<GroupsIcon />}
                selected={selected}
                setSelected={setSelected}
                requiredAccessLevel={["Super_Admin", "Admin"]}
                accessLevel={user.accessLevel}
              />

              <Item
                title={t("sidebar.Einladen")}
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
                Unternehmen
              </Typography>
              <Item
                title={t("sidebar.Verfügbarkeit")}
                to="/availability"
                icon={<EventAvailableIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title={t("sidebar.Company")}
                to="/company"
                icon={<BusinessIcon />}
                selected={selected}
                setSelected={setSelected}
                requiredAccessLevel={["Super_Admin", "Admin"]}
                accessLevel={user.accessLevel}
              />

              <Item
                title={t("sidebar.Planung")}
                to="/planning"
                icon={<EventNoteIcon />}
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
                Einteilungen
              </Typography>
              <Item
                title={t("sidebar.Schichtplan")}
                to="/plan"
                icon={<CalendarViewMonthIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title={t("sidebar.Schichtplan")}
                to="/plan2"
                icon={<CalendarViewMonthIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title={t("sidebar.Kalender")}
                to="/calendar"
                icon={<CalendarTodayOutlinedIcon />}
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
                title={t("sidebar.Einstellungen")}
                to="/update"
                icon={<SettingsIcon />}
                selected={selected}
                setSelected={setSelected}
              />
              <Item
                title={t("sidebar.FAQ")}
                to="/faq"
                icon={<HelpOutlineOutlinedIcon />}
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
                title={t("sidebar.Neuer User")}
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
  }
};

export default Sidebar;
