import { useSelector } from "react-redux";
import { Paper, Box, CircularProgress, Fade } from "@mui/material";
import { useEffect, useState } from "react";
import Logo from "./Logo";

const GlobalLoading = () => {
  const { globalLoading } = useSelector((state) => state.globalLoading);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (globalLoading) {
      setIsLoading(true);
    } else {
      // Giữ loading thêm 300ms để tránh nhấp nháy
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [globalLoading]);

  return (
    <Fade in={isLoading} timeout={{ enter: 300, exit: 300 }}>
      <Paper
        square
        sx={{
          pointerEvents: "none",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1300,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Logo />
        <CircularProgress
          color="primary"
          size={48}
          thickness={4}
          sx={{ mt: 3 }}
        />
      </Paper>
    </Fade>
  );
};

export default GlobalLoading;