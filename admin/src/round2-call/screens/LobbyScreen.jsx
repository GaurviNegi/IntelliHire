/* eslint-disable no-unused-vars */
import React, { useCallback, useState, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Image,
  Input,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react";
import PropTypes from "prop-types"; // Import PropTypes
import { Room } from "y-webrtc";
import { Users } from "lucide-react";

function LobbyScreen() {
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/round2/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <Flex minHeight="100vh">
      {/* Left side */}
      <Box
        width="50%"
        bg="purple.800"
        color="white"
        p={8}
        position="relative"
        minHeight="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Image
          src="https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Background"
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          objectFit="contain"
          opacity={0.1}
        />
        <VStack
          spacing={6}
          align="flex-start"
          position="relative"
          zIndex={1}
          maxWidth="80%"
        >
          <Users size={48} />
          <Heading as="h1" size="2xl" shadow={100}>
            Intellihire
          </Heading>
          <Text fontSize="xl">
            Elevate your hiring process with our cutting-edge interview
            platform. Connect with top talent and make informed decisions
            effortlessly.
          </Text>
        </VStack>
      </Box>

      {/* Right side */}
      <Flex width="50%" alignItems="center" justifyContent="center">
        <VStack
          as="form"
          onSubmit={handleSubmit}
          spacing={6}
          width="80%"
          maxWidth="400px"
        >
          <Heading as="h2" size="xl" textAlign="center">
            Join Room
          </Heading>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="Enter your email"
              size="lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Room Number</FormLabel>
            <Input
              placeholder="Enter room number"
              size="lg"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="purple" size="lg" width="100%">
            Join
          </Button>
        </VStack>
      </Flex>
    </Flex>
  );
}

export default LobbyScreen;
