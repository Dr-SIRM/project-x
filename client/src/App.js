import { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import AuthProvider, { AuthContext } from "./AuthContext";
import PrivateRoute from "./PrivateRoute";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Login from "./scenes/login";
import ForgetPassword from "./scenes/forget_password";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Availability from "./scenes/availability";
import Update from "./scenes/update";
import Invite from "./scenes/invite";
import Contacts from "./scenes/contacts";
import Company from "./scenes/company";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Plan from "./scenes/plan";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            <AppContent isSidebar={isSidebar} setIsSidebar={setIsSidebar} />
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

function AppContent({ isSidebar, setIsSidebar }) {
  const { user } = useContext(AuthContext);
  const isAuthenticated = !!user;

  return (
    <>
      {isAuthenticated && isSidebar && <Sidebar />}
      <main className="content">
        {isAuthenticated && <Topbar />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forget_password" element={<ForgetPassword />} />
          <Route path="/dashboard" element={<PrivateRoute component={Dashboard} accessLevels={["Admin", "User"]} />} />
          <Route path="/availability" element={<PrivateRoute component={Availability} accessLevels="Admin" />} />
          <Route path="/Team" element={<PrivateRoute component={Team} accessLevels="Admin" />} />
          <Route path="/Update" element={<PrivateRoute component={Update} accessLevels={["Admin", "User"]} />} />
          <Route path="/Invite" element={<PrivateRoute component={Invite} accessLevels="Admin" />} />
          <Route path="/company" element={<PrivateRoute component={Company} accessLevels="Admin" />} />
          <Route path="/Contacts" element={<PrivateRoute component={Contacts} accessLevels="Admin" />} />
          <Route path="/Bar" element={<PrivateRoute component={Bar} accessLevels="Admin" />} />
          <Route path="/Form" element={<PrivateRoute component={Form} accessLevels="Admin" />} />
          <Route path="/Line" element={<PrivateRoute component={Line} accessLevels="Admin" />} />
          <Route path="/Pie" element={<PrivateRoute component={Pie} accessLevels="Admin" />} />
          <Route path="/FAQ" element={<PrivateRoute component={FAQ} accessLevels="Admin" />} />
          <Route path="/Plan" element={<PrivateRoute component={Plan} accessLevels="Admin" />} />
          <Route path="/Geography" element={<PrivateRoute component={Geography} accessLevels="Admin" />} />
          <Route path="/Calendar" element={<PrivateRoute component={Calendar} accessLevels="Admin" />} />
        </Routes>
      </main>
    </>
  );
}

export default App;