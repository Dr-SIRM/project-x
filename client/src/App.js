import { useState, useEffect, useContext } from "react";
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { useLocation, Navigate } from "react-router-dom";
import AuthProvider from "./AuthContext";
import PrivateRoute from "./PrivateRoute";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Login from "./scenes/login";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Availability from "./scenes/availability";
import Update from "./scenes/update";
import Invite from "./scenes/invite";
import Invoices from "./scenes/invoices";
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
import axios from "axios";
import { AuthContext } from "./AuthContext";


function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const isAuthenticated = location.pathname !== "/"; // Check if the user is authenticated
  // const { user } = useContext(AuthContext);
  // const isAuthenticated = !!user;


  // useEffect(() => {
    // fetchData();
  // }, []);

  // Data fetch for User-Display in Team.jsx
  // async function fetchData() {
    // try {
      // const response = await axios.get("http://localhost:5000/api/login");
      // const data = response.data;
      // setUsers(data);
    // } catch (error) {
      // console.error("Error fetching data:", error.response ? error.response : error);
      // setMessage("An error occurred while fetching data.");
    // }
  // }

  return (
    <AuthProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="app">
            {isAuthenticated && isSidebar && <Sidebar />}
            <main className="content">
              {isAuthenticated && <Topbar />}
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<PrivateRoute component={Dashboard} accessLevel="Admin" />} />
                <Route path="/availability" element={<PrivateRoute component={Availability} accessLevel="Admin" />} />
                <Route path="/Team" element={<PrivateRoute component={Team} accessLevel="Admin" />} />
                <Route path="/Update" element={<PrivateRoute component={Update} accessLevel="Admin" />} />
                <Route path="/Invite" element={<PrivateRoute component={Invite} accessLevel="Admin" />} />
                <Route path="/Invoices" element={<PrivateRoute component={Invoices} accessLevel="Admin" />} />
                <Route path="/company" element={<PrivateRoute component={Company} accessLevel="Admin" />} />
                <Route path="/Contacts" element={<PrivateRoute component={Contacts} accessLevel="Admin" />} />
                <Route path="/Bar" element={<PrivateRoute component={Bar} accessLevel="Admin" />} />
                <Route path="/Form" element={<PrivateRoute component={Form} accessLevel="Admin" />} />
                <Route path="/Line" element={<PrivateRoute component={Line} accessLevel="Admin" />} />
                <Route path="/Pie" element={<PrivateRoute component={Pie} accessLevel="Admin" />} />
                <Route path="/FAQ" element={<PrivateRoute component={FAQ} accessLevel="Admin" />} />
                <Route path="/Plan" element={<PrivateRoute component={Plan} accessLevel="Admin" />} />
                <Route path="/Geography" element={<PrivateRoute component={Geography} accessLevel="Admin" />} />
                <Route path="/Calendar" element={<PrivateRoute component={Calendar} accessLevel="Admin" />} />
              </Routes>
            </main>
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AuthProvider>
  );
}

export default App;