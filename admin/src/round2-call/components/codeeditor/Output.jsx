/* eslint-disable no-unused-vars */
import { Box, Button, Text, useToast } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { executeCode } from "../../api";
import PropTypes from "prop-types";
import { useSyncedStore } from "@syncedstore/react";
import { store, connect, disconnect } from "../../store";

const Output = ({ editorRef, language }) => {
  const toast = useToast();
  const [output, setOutput] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const state = useSyncedStore(store);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  const runCode = async () => {
    const sourceCode = editorRef.current.getValue();
    if (!sourceCode) return;
    try {
      setIsLoading(true);
      store.output.splice(0, store.output.length);
      const { run: result } = await executeCode(language, sourceCode);
      setOutput(result.output.split("\n"));
      store.output.push(result.output);
      console.log(result.output);
      result.stderr ? setIsError(true) : setIsError(false);
    } catch (error) {
      console.log(error);
      toast({
        title: "An error occurred.",
        description: error.message || "Unable to run code",
        status: "error",
        duration: 6000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="50%">
      <Text mb={2} fontSize="lg">
        Output
      </Text>
      <Button
        variant="outline"
        colorScheme="green"
        mb={4}
        isLoading={isLoading}
        onClick={runCode}
      >
        Run Code
      </Button>
      <Box
        height="75vh"
        p={2}
        color={isError ? "red.400" : ""}
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : "#333"}
      >
        {state.output
          ? state.output.map((line, i) => <Text key={i}>{line}</Text>)
          : 'Click "Run Code" to see the output here'}
      </Box>
    </Box>
  );
};

Output.propTypes = {
  editorRef: PropTypes.object.isRequired, // Define prop type for editorRef
  language: PropTypes.string.isRequired, // Define prop type for language
};

export default Output;
