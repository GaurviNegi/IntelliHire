// round2-call/AppRoutes.jsx
import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ChakraProvider, Box, ColorModeScript } from "@chakra-ui/react";
import LobbyScreen from "./screens/LobbyScreen";
import RoomScreen from "./screens/RoomScreen";
import { SocketProvider } from "./context/SocketProvider";
import theme from "./theme";

const AppRoutes = () => {
   useEffect(() => {
    // Set Chakra color mode theme to dark
    document.body.className = "";
    document.documentElement.setAttribute("data-theme", "dark");
    document.documentElement.style.colorScheme = "dark";

    // 🔁 Cleanup: reset Chakra color mode when leaving this route
    return () => {
      localStorage.removeItem("chakra-ui-color-mode");
      document.documentElement.removeAttribute("data-theme");
      document.documentElement.style.colorScheme = "light"; // or reset as needed
    };
  }, []);

  return (
    <>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <ChakraProvider theme={theme}>
        <SocketProvider>
          <Box>
            <Routes>
              <Route path="/" element={<LobbyScreen />} />
              <Route path="/room/:roomId" element={<RoomScreen />} />
            </Routes>
          </Box>
        </SocketProvider>
      </ChakraProvider>
    </>
  );
};

export default AppRoutes;


