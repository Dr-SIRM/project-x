import { createContext, useMemo, useState } from "react";
import { createTheme } from "@mui/material/styles";

//color design tokens
export const tokens = (mode) => ({
  ...(mode === "dark"
    ? {
        grey: {
          100: "#EDF7F6",
          200: "#f5f5f5",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#3d3d3d",
          800: "#292929",
          900: "#FFFFFF", //white
        },
        primary: {
          100: "#000000", //black
          200: "#a1a4ab",
          300: "#727681",
          400: "#1F2A40",
          500: "#141b2d",
          600: "#101624",
          700: "#0c101b",
          800: "#2E2E2E", //grey black
          900: "#040509",
        },
        greenAccent: {
          100: "#dbf5ee",
          200: "#b7ebde",
          300: "#94e2cd",
          400: "#70d8bd",
          500: "#22E3B6", //logo green
          600: "#3da58a",
          700: "#2e7c67",
          800: "#1e5245",
          900: "#0f2922",
        },
        redAccent: {
          100: "#f8dcdb",
          200: "#f1b9b7",
          300: "#e99592",
          400: "#e2726e",
          500: "#db4f4a",
          600: "#af3f3b",
          700: "#832f2c",
          800: "#58201e",
          900: "#2c100f",
        },
        blueAccent: {
          100: "#e1e2fe",
          200: "#c3c6fd",
          300: "#a4a9fc",
          400: "#868dfb",
          500: "#6870fa",
          600: "#535ac8",
          700: "#3e4396",
          800: "#2a2d64",
          900: "#151632",
        },
      }
    : {
        grey: {
          100: "#141414",
          200: "#292929",
          300: "#3d3d3d",
          400: "#525252",
          500: "#666666",
          600: "#858585",
          700: "#a3a3a3",
          800: "#c2c2c2",
          900: "#e0e0e0",
        },
        primary: {
          100: "#040509",
          200: "#080b12",
          300: "#0c101b",
          400: "#f2f0f0",
          500: "#141b2d",
          600: "#434957",
          700: "#727681",
          800: "#a1a4ab",
          900: "#d0d1d5",
        },
        greenAccent: {
          100: "#0f2922",
          200: "#1e5245",
          300: "#2e7c67",
          400: "#3da58a",
          500: "#4cceac",
          600: "#70d8bd",
          700: "#94e2cd",
          800: "#b7ebde",
          900: "#dbf5ee",
        },
        redAccent: {
          100: "#2c100f",
          200: "#58201e",
          300: "#832f2c",
          400: "#af3f3b",
          500: "#db4f4a",
          600: "#e2726e",
          700: "#e99592",
          800: "#f1b9b7",
          900: "#f8dcdb",
        },
        blueAccent: {
          100: "#151632",
          200: "#2a2d64",
          300: "#3e4396",
          400: "#535ac8",
          500: "#6870fa",
          600: "#868dfb",
          700: "#a4a9fc",
          800: "#c3c6fd",
          900: "#e1e2fe",
        },
      }),
});
//mui theme settings
export const themeSettings = (mode) => {
  const colors = tokens(mode);

  return {
    palette: {
      mode: mode,
      ...(mode === "dark"
        ? {
            primary: {
              main: colors.primary[800],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: colors.grey[200],
            },
          }
        : {
            primary: {
              main: colors.primary[800],
            },
            secondary: {
              main: colors.greenAccent[500],
            },
            neutral: {
              dark: colors.grey[700],
              main: colors.grey[500],
              light: colors.grey[100],
            },
            background: {
              default: "#fcfcfc",
            },
          }),
    },
    components: {
      MuiInputLabel: {
        styleOverrides: {
          root: { // this applies to the label element within the TextField
            color: '#2E2E2E', // Set the color of the label to black
          },
        },
      },
      MuiInputBase: { // For changing the text color of TextField
        styleOverrides: {
          input: { // This applies to the actual input element within the TextField
            color: '#2E2E2E', // Set the text color to black
            backgroundColor: colors.grey[200], // Keeping the background color to grey[200] as set before
          },
        },
      },
      MuiFilledInput: {
        styleOverrides: {
          underline: {
            '&:before': {
              borderColor: '#2E2E2E', // Set default border color to black
            },
            '&:hover:not(.Mui-disabled):before': {
              borderColor: '#2E2E2E', // Set hover border color to black
            },
          },
          root: {
            '& .MuiFilledInput-input': {
              borderColor: '#2E2E2E', // Set border color of the input to black
            }
          }
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            color: 'white', // This will set the text color of all Button components to black.
            // If you want to also set the background color, uncomment the next line.
            // backgroundColor: 'desiredBackgroundColor',
          },
          // If you want to also change the styles for specific variants or states, you can do it like this:
          outlined: {
            color: '#2E2E2E', // This will set the text color of all outlined Button components to black.
          },
        },
      },
      
      MuiOutlinedInput: {
        styleOverrides: {
          root: {

            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: '#2E2E2E', // Set default border color to black
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: '#2E2E2E', // Set hover border color to black
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: '#2E2E2E', // Set focused border color to black
            },
            input: { // this applies to the actual input element within the TextField
              backgroundColor: colors.grey[200], // Set the background color to grey[100]
            },

          },
        },
      },
    },
    typography: {
      fontFamily: ["Poppins", "Roboto", "Sourse Sans Pro", "sans-serif"].join(","),
      fontSize: 12,
      color: "#2E2E2E",
      h1: {
        fontFamily: ["Poppins", "Roboto", "Sourse Sans Pro", "sans-serif"].join(","),
        fontSize: 40,
        
        
      },
      h2: {
        fontFamily: ["Poppins", "Roboto", "Sourse Sans Pro", "sans-serif"].join(","),
        fontSize: 32,
        color: "#2E2E2E",
        
      },
      h3: {
        fontFamily: ["Poppins", "Roboto", "Sourse Sans Pro", "sans-serif"].join(","),
        fontSize: 24,
        color: "#2E2E2E",
      },
      h4: {
        fontFamily: ["Poppins", "Roboto","Sourse Sans Pro", "sans-serif"].join(","),
        fontSize: 20,
        color: "#2E2E2E",
      },
      h5: {
        fontFamily: ["Poppins", "Roboto","Sourse Sans Pro", "sans-serif"].join(","),
        fontSize: 16,
        color: "#2E2E2E",
      },
      h6: {
        fontFamily: ["Poppins", "Roboto", "Sourse Sans Pro", "sans-serif"].join(","),
        fontSize: 14,
        color: "#2E2E2E",
      },
    },
  };
};

//context for color mode
export const ColorModeContext = createContext({
  toggleColorMore: () => {},
});

export const useMode = () => {
  const [mode, setMode] = useState("dark");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () =>
        setMode((prev) => (prev === "light" ? "dark" : "light")),
    }),
    []
  );
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  return [theme, colorMode];
};
