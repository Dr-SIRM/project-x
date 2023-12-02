import {
  Box,
  IconButton,
  useTheme,
  Popover,
  Typography,
  Link,
  MenuItem,
  Menu,
} from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "../../AuthContext";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";
import LanguageIcon from "@mui/icons-material/Language";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const authContext = useContext(AuthContext);
  const { logout } = authContext;
  const { t, i18n } = useTranslation();
  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsAnchor, setSettingsAnchor] = useState(null);

  const handleLogoutMouseEnter = () => {
    setIsLogoutHovered(true);
  };

  const handleLogoutMouseLeave = () => {
    setIsLogoutHovered(false);
  };

  const handleNotificationsClick = (event) => {
    setIsNotificationsOpen(true);
    setNotificationsAnchor(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setIsNotificationsOpen(false);
  };

  //Language change const
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
    // console.log("Language changed to:", lang);
    handleClose();
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
      backgroundColor="white"
    >
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.grey[200]}
        borderRadius="15px"
      >
        <InputBase
          sx={{ ml: 2, flex: 1, color: "black" }}
          placeholder="Search"
        />
        <IconButton type="button" sx={{ p: 1, color: "black" }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box justifyContent="flex-end" sx={{ width: "960px", display: "flex" }}>
        <IconButton
          onClick={handleClick}
          color="inherit"
          style={{ color: "black" }}
        >
          <LanguageIcon />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleLanguageChange("de")}>DE</MenuItem>
          <MenuItem onClick={() => handleLanguageChange("en")}>EN</MenuItem>
        </Menu>

        <IconButton onClick={handleNotificationsClick} sx={{ color: "black" }}>
          <NotificationsOutlinedIcon />
        </IconButton>

        <Popover
          open={isNotificationsOpen}
          anchorEl={notificationsAnchor}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
          sx={{
            "& .MuiPaper-root": {
              minHeight: "400px",
              maxWidth: "300px",
              borderRadius: "8px",
            },
          }}
        >
          <Box sx={{ padding: "10px" }}>
            <Typography variant="body2">
              Recent changes and notifications will be displayed here.
            </Typography>
          </Box>
        </Popover>
        <IconButton
          onClick={logout}
          onMouseEnter={handleLogoutMouseEnter}
          onMouseLeave={handleLogoutMouseLeave}
          sx={{ position: "relative", color: "black" }}
        >
          <LogoutIcon />
          <span
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginTop: "4px",
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              fontSize: "12px",
              opacity: isLogoutHovered ? 0.8 : 0,
              borderRadius: "3px",
              padding: "4px 8px",
              zIndex: 1,
              transition: "opacity 0.3s ease-in-out",
            }}
          >
            Logout
          </span>
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
