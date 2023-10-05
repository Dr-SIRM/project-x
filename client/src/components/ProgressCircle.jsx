import React, { useEffect, useRef, useState } from 'react';
import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const ProgressCircle = ({ progress = 0.75, size = 40 }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [currentProgress, setCurrentProgress] = useState(0);
  const requestRef = useRef();

  const animateProgress = () => {
    if (currentProgress < progress) {
      setCurrentProgress((prev) => Math.min(prev + 0.01, progress));
      requestRef.current = requestAnimationFrame(animateProgress);
    }
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateProgress);
    return () => cancelAnimationFrame(requestRef.current);
  }, [progress]);

  const angle = currentProgress * 360;
  return (
    <Box
      sx={{
        background: `radial-gradient(${colors.primary[400]} 55%, transparent 56%),
            conic-gradient(transparent 0deg ${angle}deg, ${colors.blueAccent[500]} ${angle}deg 360deg),
            ${colors.greenAccent[500]}`,
        borderRadius: "50%",
        width: `${size}px`,
        height: `${size}px`,
      }}
    />
  );
};

export default ProgressCircle;
