import { useState, useEffect, useContext } from "react";
import {
  useTheme,
  Box,
  Button,
  TextField,
  Snackbar,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import { useTranslation } from "react-i18next";
import "../../i18n";

const SolverReq = ({ solverreq }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [solverData, setsolverData] = useState({});
  const token = localStorage.getItem("session_token"); // Get the session token from local storage
  const { t, i18n } = useTranslation();
  const [isChecked, setIsChecked] = useState(false);
  const [inputText, setInputText] = useState("");
  const [selectedOption, setSelectedOption] = useState(
    t("solverreq.Mindestanforderungen")
  );

  useEffect(() => {
    const fetchSolver = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/solver/requirement`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setsolverData(response.data);
      } catch (error) {
        // console.error("Error fetching Solver details:", error);
      }
    };

    fetchSolver();
  }, []);

  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post(
        `${API_BASE_URL}/api/solver/requirement`,
        { ...values },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setShowSuccessNotification(true);
    } catch (error) {
      // console.error("Error updating solver details:", error);
      setShowErrorNotification(true);
    }
  };

  const validationSchema = yup.object({
    max_time_week: yup
      .number()
      .min(
        solverData.weekly_hours,
        `${t("solverreq.yup_max_week_1")} ${solverData.weekly_hours} ${t(
          "solverreq.yup_max_week_2"
        )}`
      )
      .required(t("solverreq.yup_required")), // Using translation for 'Required'
  });

  return (
    <Box m="20px">
      <Header title={t("solverreq.title")} subtitle={t("solverreq.subtitle")} />
      <Box display="flex" justifyContent="center" mb="20px">
        <Button
          onClick={() => setSelectedOption(t("solverreq.Mindestanforderungen"))}
          sx={{
            color:
              selectedOption === t("solverreq.Mindestanforderungen")
                ? "white"
                : colors.primary[100],
            backgroundColor:
              selectedOption === t("solverreq.Mindestanforderungen")
                ? colors.primary[100]
                : "transparent",
            marginRight: "10px",
          }}
        >
          {t("solverreq.Mindestanforderungen")}
        </Button>
        <Button
          onClick={() => setSelectedOption(t("solverreq.title2"))}
          sx={{
            color:
              selectedOption === t("solverreq.title2")
                ? "white"
                : colors.primary[100],
            backgroundColor:
              selectedOption === t("solverreq.title2")
                ? colors.primary[100]
                : "transparent",
          }}
        >
          {t("solverreq.title2")}
        </Button>
      </Box>

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{
          company_name: solverData.company_name || "",
          weekly_hours: solverData.weekly_hours || "",
          shifts: solverData.shifts || "",
          desired_min_time_day: solverData.desired_min_time_day || "",
          desired_max_time_day: solverData.desired_max_time_day || "",
          min_time_day: solverData.min_time_day || "",
          max_time_day: solverData.max_time_day || "",
          desired_max_time_week: solverData.desired_max_time_week || "",
          max_time_week: solverData.max_time_week || "",
          hour_divider: String(solverData.hour_divider) || "",
          fair_distribution: solverData.fair_distribution || "",
          week_timeframe: String(solverData.week_timeframe) || "",
          subsequent_workingdays: solverData.subsequent_workingdays || "",
          subsequent_workingdays_max:
            solverData.subsequent_workingdays_max || "",
          daily_deployment: String(solverData.daily_deployment) || "",
          time_per_deployment: solverData.time_per_deployment || "",
          new_fte_per_slot: solverData.new_fte_per_slot || "",
          subsequent_workingdays_max:
            solverData.subsequent_workingdays_max || "",
          skills_per_day: String(solverData.skills_per_day) || "",
          nb1: String(solverData.nb1) || "",
          nb2: String(solverData.nb2) || "",
          nb3: String(solverData.nb3) || "",
          nb4: String(solverData.nb4) || "",
          nb5: String(solverData.nb5) || "",
          nb6: String(solverData.nb6) || "",
          nb7: String(solverData.nb7) || "",
          nb8: String(solverData.nb8) || "",
          nb9: String(solverData.nb9) || "",
          nb10: String(solverData.nb10) || "",
          nb11: String(solverData.nb11) || "",
          nb12: String(solverData.nb12) || "",
          nb13: String(solverData.nb13) || "",
          nb14: String(solverData.nb14) || "",
          nb15: String(solverData.nb15) || "",
          nb16: String(solverData.nb16) || "",
          nb17: String(solverData.nb17) || "",
          nb18: String(solverData.nb18) || "",
          nb19: String(solverData.nb19) || "",
          nb20: String(solverData.nb20 || ""),
        }}
        validationSchema={validationSchema}
      >
        {({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            {selectedOption === t("solverreq.Mindestanforderungen") ? (
              <div>
                <Typography variant="h4">
                  {t("solverreq.Mindestanforderungen")}
                </Typography>
                <br></br>
                <br></br>
                <Box
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(10, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 10",
                    },
                  }}
                >
                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.wishedminworkinghoursperday")}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label=""
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.desired_min_time_day}
                    name="desired_min_time_day"
                    error={
                      !!touched.desired_min_time_day &&
                      !!errors.desired_min_time_day
                    }
                    helperText={
                      touched.desired_min_time_day &&
                      errors.desired_min_time_day
                    }
                    sx={{
                      gridColumn: "span 1",
                      maxWidth: "150px",
                      "& .MuiFilledInput-input": {
                        paddingTop: "0px",
                        paddingBottom: "2px",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      },
                    }}
                  />
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.mintimeperday")}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label=""
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.min_time_day}
                    name="min_time_day"
                    error={!!touched.min_time_day && !!errors.min_time_day}
                    helperText={touched.min_time_day && errors.min_time_day}
                    sx={{
                      gridColumn: "span 1",
                      maxWidth: "150px",
                      "& .MuiFilledInput-input": {
                        paddingTop: "0px",
                        paddingBottom: "2px",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      },
                    }}
                  />

                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.wishedmaxworkinghoutperday")}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label=""
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.desired_max_time_day}
                    name="desired_max_time_day"
                    error={
                      !!touched.desired_max_time_day &&
                      !!errors.desired_max_time_day
                    }
                    helperText={
                      touched.desired_max_time_day &&
                      errors.desired_max_time_day
                    }
                    sx={{
                      gridColumn: "span 1",
                      maxWidth: "150px",
                      "& .MuiFilledInput-input": {
                        paddingTop: "0px",
                        paddingBottom: "2px",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      },
                    }}
                  />
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.maxworktimeperday")}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label=""
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.max_time_day}
                    name="max_time_day"
                    error={!!touched.max_time_day && !!errors.max_time_day}
                    helperText={touched.max_time_day && errors.max_time_day}
                    sx={{
                      gridColumn: "span 1",
                      maxWidth: "150px",
                      "& .MuiFilledInput-input": {
                        paddingTop: "0px",
                        paddingBottom: "2px",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      },
                    }}
                  />

                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.subsequent_workingdays")}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label=""
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.subsequent_workingdays}
                    name="subsequent_workingdays"
                    error={
                      !!touched.subsequent_workingdays &&
                      !!errors.subsequent_workingdays
                    }
                    helperText={
                      touched.subsequent_workingdays &&
                      errors.subsequent_workingdays
                    }
                    sx={{
                      gridColumn: "span 1",
                      maxWidth: "150px",
                      "& .MuiFilledInput-input": {
                        paddingTop: "0px",
                        paddingBottom: "2px",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      },
                    }}
                  />

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.subsequent_workingdays_max")}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label=""
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.subsequent_workingdays_max}
                    name="subsequent_workingdays_max"
                    error={
                      !!touched.subsequent_workingdays_max &&
                      !!errors.subsequent_workingdays_max
                    }
                    helperText={
                      touched.subsequent_workingdays_max &&
                      errors.subsequent_workingdays_max
                    }
                    sx={{
                      gridColumn: "span 1",
                      maxWidth: "150px",
                      "& .MuiFilledInput-input": {
                        paddingTop: "0px",
                        paddingBottom: "2px",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      },
                    }}
                  />

                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.maxtimeperweek")}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label=""
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.max_time_week}
                    name="max_time_week"
                    error={!!touched.max_time_week && !!errors.max_time_week}
                    helperText={touched.max_time_week && errors.max_time_week}
                    sx={{
                      gridColumn: "span 1",
                      maxWidth: "150px",
                      "& .MuiFilledInput-input": {
                        paddingTop: "0px",
                        paddingBottom: "2px",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      },
                    }}
                  />
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 6",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.minhoursperworkingshift")}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label=""
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.time_per_deployment}
                    name="time_per_deployment"
                    error={
                      !!touched.time_per_deployment &&
                      !!errors.time_per_deployment
                    }
                    helperText={
                      touched.time_per_deployment && errors.time_per_deployment
                    }
                    sx={{
                      gridColumn: "span 1",
                      maxWidth: "150px",
                      "& .MuiFilledInput-input": {
                        paddingTop: "0px",
                        paddingBottom: "2px",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      },
                    }}
                  />
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 6",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>

                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.new_fte_per_slot")}
                  </Typography>
                  <TextField
                    fullWidth
                    variant="filled"
                    type="text"
                    label=""
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.new_fte_per_slot}
                    name="new_fte_per_slot"
                    error={
                      !!touched.new_fte_per_slot && !!errors.new_fte_per_slot
                    }
                    helperText={
                      touched.new_fte_per_slot && errors.new_fte_per_slot
                    }
                    sx={{
                      gridColumn: "span 1",
                      maxWidth: "150px",
                      "& .MuiFilledInput-input": {
                        paddingTop: "0px",
                        paddingBottom: "2px",
                        justifyContent: "center",
                        alignItems: "center",
                        textAlign: "center",
                      },
                    }}
                  />
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 6",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>

                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.hourunit")}
                  </Typography>
                  <Select
                    labelId="hour_divider-label"
                    id="hour_divider"
                    name="hour_divider"
                    value={values.hour_divider}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.hour_divider && !!errors.hour_divider}
                    helperText={touched.hour_divider && errors.hour_divider}
                    sx={{
                      gridColumn: "span 1",
                      "& .MuiSelect-select": {
                        textAlign: "center", // Center align the selected value
                      },
                    }}
                  >
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                  </Select>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 6",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>

                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.calculationtimeframe")}
                  </Typography>
                  <Select
                    labelId="week_timeframe-label"
                    id="week_timeframe"
                    value={values.week_timeframe}
                    name="week_timeframe"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.week_timeframe && !!errors.week_timeframe}
                    helperText={touched.week_timeframe && errors.week_timeframe}
                    sx={{
                      gridColumn: "span 1",
                      "& .MuiSelect-select": {
                        textAlign: "center", // Center align the selected value
                      },
                    }}
                  >
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                    <MenuItem value="4">4</MenuItem>
                  </Select>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 6",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>

                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.countofshiftsperday")}
                  </Typography>
                  <Select
                    labelId="daily_deployment-label"
                    id="daily_deployment"
                    value={values.daily_deployment}
                    name="daily_deployment"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      !!touched.daily_deployment && !!errors.daily_deployment
                    }
                    helperText={
                      touched.daily_deployment && errors.daily_deployment
                    }
                    sx={{
                      gridColumn: "span 1",
                      "& .MuiSelect-select": {
                        textAlign: "center", // Center align the selected value
                      },
                    }}
                  >
                    <MenuItem value="1">1</MenuItem>
                    <MenuItem value="2">2</MenuItem>
                  </Select>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 6",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>

                  {/* New Line */}

                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 3",
                      display: "flex",
                      alignItems: "left",
                      justifyContent: "left",
                      height: "100%",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.skills_per_day")}
                  </Typography>
                  <Select
                    labelId="skills_per_day-label"
                    id="skills_per_day"
                    name="skills_per_day"
                    value={values.skills_per_day}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={!!touched.skills_per_day && !!errors.skills_per_day}
                    helperText={touched.skills_per_day && errors.skills_per_day}
                    sx={{
                      gridColumn: "span 1",
                      "& .MuiSelect-select": {
                        textAlign: "center", // Center align the selected value
                      },
                    }}
                  >
                    <MenuItem value="0">0</MenuItem>
                    <MenuItem value="1">1</MenuItem>
                  </Select>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 6",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                </Box>
              </div>
            ) : (
              <div>
                <Typography variant="h4">{t("solverreq.title2")}</Typography>
                <br></br>
                <Box
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(18, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 18",
                    },
                  }}
                >
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 9",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 2",
                      display: "grid",
                      alignItems: "left",
                      textAlign: "left",
                      height: "100%",
                    }}
                  >
                    {t("solverreq.low_ranking")}
                  </Typography>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 2",
                      display: "grid",
                      alignItems: "right",
                      textAlign: "right",
                      height: "100%",
                    }}
                  >
                    {t("solverreq.high_ranking")}
                  </Typography>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "right",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb1")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb1}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb1" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb2")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb2}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb2" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb3")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb3}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb3" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb4")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb4}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb4" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb5")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb5}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb5" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb6")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb6}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb6" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb7")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb7}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb7" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb8")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb8}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb8" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb9")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb9}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb9" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb10")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb10}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb10" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb11")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb11}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb11" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                  {/* New Line */}
                  <Typography
                    color={colors.primary[100]}
                    variant="h6"
                    sx={{
                      gridColumn: "span 9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "left",
                      height: "100%",
                      padding: "0 8px",
                      backgroundColor: "#f0f0f0",
                    }}
                  >
                    {t("solverreq.nb12")}
                  </Typography>
                  <ToggleButtonGroup
                    value={values.nb12}
                    exclusive
                    onChange={(_, newValue) =>
                      handleChange({
                        target: { value: newValue, name: "nb12" },
                      })
                    }
                    onBlur={handleBlur}
                    sx={{
                      gridColumn: "span 4",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5].map((value) => (
                      <ToggleButton
                        key={value}
                        value={value.toString()}
                        aria-label={value.toString()}
                        sx={{
                          borderColor: "gray",
                          borderWidth: 1,
                          borderStyle: "solid",
                          color: "black", // Ensuring text color is black
                          "&.Mui-selected": {
                            backgroundColor: colors.greenAccent[400],
                            color: "white", // Ensuring selected text color is white
                          },
                        }}
                      >
                        {value}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                  <Typography
                    color={colors.primary[100]}
                    variant=""
                    sx={{
                      gridColumn: "span 4",
                      display: "grid",
                      alignItems: "center",
                      height: "100%",
                    }}
                  ></Typography>
                </Box>
              </div>
            )}
            <Box display="flex" justifyContent="end" mt="20px">
              <Button type="submit" color="primary" variant="contained">
                {t("button.submit")}
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Snackbar
        open={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        message={t("notification.success_timereq")}
        autoHideDuration={3000}
        sx={{
          backgroundColor: "green !important",
          color: "white",
          "& .MuiSnackbarContent-root": {
            borderRadius: "4px",
            padding: "15px",
            fontSize: "16px",
          },
        }}
      />
      <Snackbar
        open={showErrorNotification}
        onClose={() => setShowErrorNotification(false)}
        message={t("notification.no_success_timereq")}
        autoHideDuration={3000}
        sx={{
          backgroundColor: "red !important",
          color: "white",
          "& .MuiSnackbarContent-root": {
            borderRadius: "4px",
            padding: "15px",
            fontSize: "16px",
          },
        }}
      />
    </Box>
  );
};

export default SolverReq;
