import { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import AuthProvider from "./AuthContext";
import PrivateRoute from "./PrivateRoute";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Login from "./scenes/login";
import Dashboard from "./scenes/dashboard";
import Team from "./scenes/team";
import Update from "./scenes/update";
import Availability from "./scenes/availability";
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
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Calendar from "./scenes/calendar";
import axios from "axios";


function App() {
  const [theme, colorMode] = useMode();
  const [isSidebar, setIsSidebar] = useState(true);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const location = useLocation();
  const isAuthenticated = location.pathname !== "/"; // Check if the user is authenticated

  useEffect(() => {
    fetchData();
  }, []);

  //Datafetch for User-Display in Team.jsx
  async function fetchData() {
    try {
      const response = await axios.get("http://localhost:5000/api/users");
      const data = response.data;
      setUsers(data);
    } catch (error) {
      console.error("Error fetching data:", error.response ? error.response : error);
      setMessage("An error occurred while fetching data.");
    }
  }


  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
         {isAuthenticated && <Sidebar isSidebar={isSidebar} />}
          <main className="content">
            {isAuthenticated && <Topbar />}
            
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route path="/" element={<Login />} /> 
                  <PrivateRoute path="/dashboard" element={<Dashboard />} />
                  <PrivateRoute path="/team" element={<Team users={users} />} />
                  <PrivateRoute path="/contacts" element={<Contacts />} />
                  <PrivateRoute path="/invoices" element={<Invoices />} />
                  <PrivateRoute path="/form" element={<Form />} />
                  <PrivateRoute path="/bar" element={<Bar />} />
                  <PrivateRoute path="/pie" element={<Pie />} />
                  <PrivateRoute path="/line" element={<Line />} />
                  <PrivateRoute path="/faq" element={<FAQ />} />
                  <PrivateRoute path="/calendar" element={<Calendar />} />
                  <PrivateRoute path="/availability" element={<Availability />} />
                  <PrivateRoute path="/geography" element={<Geography />} />
                  <PrivateRoute path="/plan" element={<Plan />} />
                  <PrivateRoute path="/company" element={<Company />} />
                  <PrivateRoute path="/invite" element={<Invite />} />
                  <PrivateRoute path="/update" element={<Update />} />
                </Routes>
              </AuthProvider>
            <p>{message}</p> 
            </BrowserRouter>
            
          </main>
        </div>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
