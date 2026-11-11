"use client"; // <-- required to run on the client

import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";

interface CustomCockieAlertProps {
  english: boolean; // Required text for the button
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}

const MyCockieAlert: React.FC<CustomCockieAlertProps> = ({ english }) => {
  const showCookiesName = "showCookies";

  const [showCookies, setShowCookies] = useState(true);

  useEffect(() => {
    try {
      // Parse cookies safely
    } catch (err) {
      console.error("Failed to read cookies:", err);
    }
  }, []);

  useEffect(() => {
    console.log("useEffect showCockie ...", showCookies);
    if (showCookies) {
    } else {
    }
  }, [showCookies]);

  //console.log("PositionedAlert ...", showCookies);
  if (!showCookies) {
    return <></>;
  }
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 4,
        right: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        //position: "absolute", // fixed position on screen
        //top: 44,
        //right: 6,
        //zIndex: 9999,
        //width: "70%",
      }}
    >
      <Alert
        severity="warning"
        onClose={() => {
          console.log("close cockies ...");
          setShowCookies(false);
        }}
        sx={{ width: "100%", opacity: 0.95 }}
      >
        {`${english ? "We use cookies to improve your experience." : "Wir verwenden Cookies, um Ihre Erfahrung zu verbessern."} `}
      </Alert>
    </Box>
  );
};

export default MyCockieAlert;
