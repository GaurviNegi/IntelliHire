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
    document.body.className = "";
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

