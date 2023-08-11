import { useState, useEffect, useContext } from "react";
import { useTheme, Box, Button, TextField, Snackbar, Typography } from "@mui/material";
import { Select, MenuItem } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import axios from 'axios';



const Solver = ({ solver }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [solverData, setsolverData] = useState({});
  const token = localStorage.getItem('session_token'); // Get the session token from local storage

  useEffect(() => {
    const fetchSolver = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/solver', {
              headers: {
                  'Authorization': `Bearer ${token}`
              }
          });
          setsolverData(response.data);
        } catch (error) {
          console.error('Error fetching Solver details:', error);
        }
    };

    fetchSolver();
  }, []);

  
  const handleFormSubmit = async (values) => {
    try {
      // Send the updated form values to the server for database update
      await axios.post('http://localhost:5000/api/solver', { ...values, solverButtonClicked: true }, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        }
    });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Error updating solver details:', error);
      setShowErrorNotification(true);
    }
  };


  return (
    <Box m="20px">
      <Header
        title="Solve"
        subtitle="Create your optimized shift plan!"
      />
      <h2>TimeTab Solver</h2>

      <Formik
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
        initialValues={{}}
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
            <br></br>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(6, minmax(0, 1fr))"
              sx={{
                "& > div": { gridColumn: isNonMobile ? undefined : "span 6" },
              }}
            >
            <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Gewünschte min. Zeit pro Tag
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.max_min_Arbeitszeit}
                name="max_min_Arbeitszeit"
                error={!!touched.max_min_Arbeitszeit && !!errors.max_min_Arbeitszeit}
                helperText={touched.max_min_Arbeitszeit && errors.max_min_Arbeitszeit}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Gewünschte max. Zeit pro Tag
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.max_max_Arbeitszeit}
                name="max_max_Arbeitszeit"
                error={!!touched.max_max_Arbeitszeit && !!errors.max_max_Arbeitszeit}
                helperText={touched.max_max_Arbeitszeit && errors.max_max_Arbeitszeit}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
            <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Min. Zeit pro Tag
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.min_Arbeitszeit}
                name="min_Arbeitszeit"
                error={!!touched.min_Arbeitszeit && !!errors.min_Arbeitszeit}
                helperText={touched.min_Arbeitszeit && errors.min_Arbeitszeit}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Max. Zeit pro Tag
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.max_Arbeitszeit}
                name="max_Arbeitszeit"
                error={!!touched.max_Arbeitszeit && !!errors.max_Arbeitszeit}
                helperText={touched.max_Arbeitszeit && errors.max_Arbeitszeit}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Toleranz gerechte Verteilung
              </Typography>
              <TextField
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.solving_time}
                name="solving_time"
                error={!!touched.solving_time && !!errors.solving_time}
                helperText={touched.solving_time && errors.solving_time}
                sx={{ gridColumn: "span 1" }}
              />
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 3",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <br></br>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 1
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb1}
                name="nb1"
                error={!!touched.nb1 && !!errors.nb1}
                helperText={touched.nb1 && errors.nb1}
                sx={{ gridColumn: "span 1" }}
              >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 2
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb2}
                name="nb2"
                error={!!touched.nb2 && !!errors.nb2}
                helperText={touched.nb2 && errors.nb2}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 3
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb3}
                name="nb3"
                error={!!touched.nb3 && !!errors.nb3}
                helperText={touched.nb3 && errors.nb3}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 4
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb4}
                name="nb4"
                error={!!touched.nb4 && !!errors.nb4}
                helperText={touched.nb4 && errors.nb4}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 5
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb5}
                name="nb5"
                error={!!touched.nb5 && !!errors.nb5}
                helperText={touched.nb5 && errors.nb5}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 6
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb6}
                name="nb6"
                error={!!touched.nb6 && !!errors.nb6}
                helperText={touched.nb6 && errors.nb6}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 7
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb7}
                name="nb7"
                error={!!touched.nb7 && !!errors.nb7}
                helperText={touched.nb7 && errors.nb7}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 8
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb8}
                name="nb8"
                error={!!touched.nb8 && !!errors.nb8}
                helperText={touched.nb8 && errors.nb8}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 9
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb9}
                name="nb9"
                error={!!touched.nb9 && !!errors.nb9}
                helperText={touched.nb9 && errors.nb9}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 10
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb10}
                name="nb10"
                error={!!touched.nb10 && !!errors.nb10}
                helperText={touched.nb10 && errors.nb10}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 11
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb11}
                name="nb11"
                error={!!touched.nb11 && !!errors.nb11}
                helperText={touched.nb11 && errors.nb11}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
              <Typography
                color={colors.greenAccent[500]}
                variant="h6"
                sx={{
                  gridColumn: "span 1",
                  display: "flex",
                  alignItems: "right",
                  height: "100%",
                }}
              >
                Nebenbedingung 12
              </Typography>
              <Select
                fullWidth
                variant="filled"
                type="text"
                label= ""
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.nb12}
                name="nb12"
                error={!!touched.nb12 && !!errors.nb12}
                helperText={touched.nb12 && errors.nb12}
                sx={{ gridColumn: "span 1" }}
                >
                <MenuItem value={ 0 }>Egal</MenuItem>
                <MenuItem value={ 10 }>1</MenuItem>
                <MenuItem value={ 30 }>2</MenuItem>
                <MenuItem value={ 80 }>3</MenuItem>
                <MenuItem value={ 200 }>4</MenuItem>
                <MenuItem value={ 100000 }>Nicht verletzen</MenuItem>
              </Select>
              <Typography
                color={colors.greenAccent[500]}
                variant=""
                sx={{
                  gridColumn: "span 1",
                  display: "grid",
                  alignItems: "center",
                  height: "100%",
                }}
              ></Typography>
            </Box>
            <Box display="flex" justifyContent="end" mt="20px">
            <Button 
                type="submit" 
                color="secondary" 
                variant="contained">
                Submit
              </Button>
            </Box>
          </form>
        )}
      </Formik>
      <Snackbar
        open={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        message="Solver Successfully Started!"
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
        message="Error occurred - Solver Stopped!"
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




export default Solver;