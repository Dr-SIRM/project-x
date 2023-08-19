import { useState, useEffect, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import AuthProvider, { AuthContext } from "./AuthContext";
import PrivateRoute from "./PrivateRoute";
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";
import Login from "./scenes/login";
import Token_Registration from "./scenes/token_registration";
import Registration from "./scenes/registration_supervisor";
import ForgetPassword from "./scenes/forget_password";
import Dashboard from "./scenes/dashboard";
import Solver from "./scenes/solver";
import SolverRequirement from "./scenes/solver_requirement";
import Team from "./scenes/team";
import Availability from "./scenes/availability";
import Update from "./scenes/update";
import Invite from "./scenes/invite";
import Company from "./scenes/company";
import Bar from "./scenes/bar";
import Form from "./scenes/form";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Geography from "./scenes/geography";
import Calendar from "./scenes/calendar";
import Planning from "./scenes/planning";
import Planning2 from "./scenes/planning2";
import Planning3 from "./scenes/planning3";
import Plan from "./scenes/plan"
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
          <Route path="/token_registration" element={<Token_Registration />} />
          <Route path="/registration/admin" element={<Registration />} />
          <Route path="/dashboard" element={<PrivateRoute component={Dashboard} accessLevels={["Super_Admin", "Admin", "User"]} />} />
          <Route path="/solver" element={<PrivateRoute component={Solver} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/solver/requirement" element={<PrivateRoute component={SolverRequirement} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/availability" element={<PrivateRoute component={Availability} accessLevels={["Super_Admin", "Admin", "User"]} />} />
          <Route path="/Team" element={<PrivateRoute component={Team} accessLevels={["Super_Admin", "Admin", "User"]} />} />
          <Route path="/Update" element={<PrivateRoute component={Update} accessLevels={["Super_Admin", "Admin", "User"]} />} />
          <Route path="/Invite" element={<PrivateRoute component={Invite} accessLevels={["Super_Admin", "Admin", "User"]} />} />
          <Route path="/company" element={<PrivateRoute component={Company} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/Bar" element={<PrivateRoute component={Bar} accessLevels={["Super_Admin", "Admin", "User"]} />} />
          <Route path="/Form" element={<PrivateRoute component={Form} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/Line" element={<PrivateRoute component={Line} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/Pie" element={<PrivateRoute component={Pie} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/FAQ" element={<PrivateRoute component={FAQ} accessLevels={["Super_Admin", "Admin", "User"]} />} />
          <Route path="/Geography" element={<PrivateRoute component={Geography} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/Calendar" element={<PrivateRoute component={Calendar} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/Planning" element={<PrivateRoute component={Planning} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/Planning2" element={<PrivateRoute component={Planning2} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/Planning3" element={<PrivateRoute component={Planning3} accessLevels={["Super_Admin", "Admin"]} />} />
          <Route path="/Plan" element={<PrivateRoute component={Plan} accessLevels={["Super_Admin", "Admin"]} />} />
        </Routes>
      </main>
    </>
  );
}

export default App;