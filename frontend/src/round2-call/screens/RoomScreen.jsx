/* eslint-disable react/no-unescaped-entities */
/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider.jsx";
import ReactPlayer from "react-player";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  HStack,
  Heading,
  Icon,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import peer from "../services/peer.js";
import CodeEditor from "../components/codeeditor/CodeEditor.jsx";
import { Phone, Send, Video } from "lucide-react";

function RoomScreen() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isFirstUser, setIsFirstUser] = useState(true);
  const [remoteStreamReceived, setRemoteStreamReceived] = useState(false);
  const [myStreamShared, setMyStreamShared] = useState(false);
  const [connected, setConnected] = useState(false);
  const { roomId } = useParams();

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log(`${email} has joined`);
    setRemoteSocketId(id);
    setIsFirstUser((prevState) => !prevState);
  }, []);

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
    setMyStreamShared(true);
    if (remoteStreamReceived) {
      setConnected(true);
    }
  }, [myStream, remoteStreamReceived]);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
    sendStreams();
  }, [remoteSocketId, sendStreams, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      setRemoteStream(remoteStream[0]);
      setRemoteStreamReceived(true);
      if (myStreamShared) {
        setConnected(true);
      }
    });
  });

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <Grid templateColumns="300px 1fr" height="100vh">
      <GridItem bg={bgColor} borderRight="1px" borderColor={borderColor}>
        <VStack spacing={6} p={4} height="100%">
          <Heading size="md" textAlign="center">
            Interview Room
          </Heading>
          <Box>
            <Text fontSize="sm" mb={2} textAlign="center">
              {connected ? (
                "Connected"
              ) : remoteSocketId ? (
                "User 2 has joined"
              ) : (
                <>
                  Wait for the Interviewer to call you <br />
                  Please ask User 2 to join the same room
                </>
              )}
            </Text>
            {!connected && (
              <Flex justifyContent="center">
                {isFirstUser && myStream && !myStreamShared && (
                  <Tooltip label="Send your video stream">
                    <Button
                      leftIcon={<Icon as={Send} />}
                      colorScheme="blue"
                      onClick={sendStreams}
                    >
                      Send Stream
                    </Button>
                  </Tooltip>
                )}
                {!isFirstUser && remoteSocketId && !remoteStreamReceived && (
                  <Tooltip label="Start the call">
                    <Button
                      leftIcon={<Icon as={Phone} />}
                      colorScheme="green"
                      onClick={handleCallUser}
                    >
                      Call
                    </Button>
                  </Tooltip>
                )}
              </Flex>
            )}
          </Box>
          <Flex
            direction="column"
            alignItems="center"
            flex={1}
            justifyContent="center"
            width="100%"
          >
            {myStream && (
              <Box mb={4} width="100%">
                <Text fontSize="sm" mb={2} textAlign="center">
                  Your Video
                </Text>
                <Box borderRadius="md" overflow="hidden">
                  <ReactPlayer playing muted width="100%" height="auto" url={myStream} />
                </Box>
              </Box>
            )}
            {remoteStream && (
              <Box width="100%">
                <Text fontSize="sm" mb={2} textAlign="center">
                  Interviewer's Video
                </Text>
                <Box borderRadius="md" overflow="hidden">
                  <ReactPlayer playing width="100%" height="auto" url={remoteStream} />
                </Box>
              </Box>
            )}
          </Flex>
          {!myStream && !remoteStream && (
            <Flex
              direction="column"
              alignItems="center"
              justifyContent="center"
              flex={1}
            >
              <Icon as={Video} boxSize={12} color="gray.400" mb={4} />
              <Text color="gray.500" textAlign="center">
                No video streams yet
              </Text>
            </Flex>
          )}
        </VStack>
      </GridItem>
      <GridItem>
        <Box height="100%" p={4}>
          <CodeEditor roomId={roomId} />
        </Box>
      </GridItem>
    </Grid>
  );
}

export default RoomScreen;
