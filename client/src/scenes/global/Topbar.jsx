import { Box, IconButton, useTheme, Popover, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "../../AuthContext";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  // Consume the AuthContext
  const authContext = useContext(AuthContext);
  const { logout } = authContext;

  const [isLogoutHovered, setIsLogoutHovered] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState(null);

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

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={2}
    >
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
        <IconButton type="button" sx={{ p: 1 }}>
          <SearchIcon />
        </IconButton>
      </Box>

      {/* ICONS */}
      <Box justifyContent="flex-end" sx={{ width: "960px", display: "flex" }}>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton onClick={handleNotificationsClick}>
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
          sx={{
            position: "relative",
          }}
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
