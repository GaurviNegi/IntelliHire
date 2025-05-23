// /* eslint-disable no-unused-vars */
// import { useState, useRef, useEffect } from "react";
// import { Editor } from "@monaco-editor/react";
// import * as Y from "yjs";
// import { WebrtcProvider } from "y-webrtc";
// import { MonacoBinding } from "y-monaco";
// import LanguageSelector from "./LanguageSelector";
// import { Box, HStack } from "@chakra-ui/react";
// import { CODE_SNIPPETS } from "../../constants";
// import Output from "./Output";
// import { useSyncedStore } from "@syncedstore/react";
// import { store, connect, disconnect } from "../../store";

// const CodeEditor = () => {
//   const [language, setLanguage] = useState("python");
//   const [value, setValue] = useState(null);

//   useEffect(() => {
//     connect();

//     return () => {
//       disconnect();
//     };
//   }, []);

//   //editor value will be shared with multiple people (YJS text value)
//   // when someone deletes will be deleted for everyone
//   const editorRef = useRef(null);

//   function handleEditorMounted(editor, monaco) {
//     editorRef.current = editor;

//     //init yjs
//     const doc = new Y.Doc(); // collection of shared objects (Text)

//     //conect to peers with webRTC
//     const provider = new WebrtcProvider("test-room", doc);
//     const type = doc.getText("monaco");

//     //bind yjs to monaco
//     const binding = new MonacoBinding(
//       type,
//       editorRef.current.getModel(),
//       new Set([editorRef.current]),
//       provider.awareness
//     );
//   }

//   const onSelect = (language) => {
//     setLanguage(language);
//     // langStore.output.push(result.output);
//   };

//   return (
//     <Box padding={10}>
//       <HStack spacing={4}>
//         <Box w="50%">
//           <LanguageSelector language={language} onSelect={onSelect} />
//           <Editor
//             height="75vh"
//             theme="vs-dark"
//             language={language}
//             onMount={handleEditorMounted}
//             value={value}
//             onChange={(value) => setValue(value)}
//           />
//         </Box>
//         <Output editorRef={editorRef} language={language} />
//       </HStack>
//     </Box>
//   );
// };

// export default CodeEditor;






/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import { Editor } from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import LanguageSelector from "./LanguageSelector"; // your language dropdown
import { Box, HStack } from "@chakra-ui/react";
import Output from "./Output"; // your output component

const CodeEditor = ({ roomId }) => {
  const [language, setLanguage] = useState("python");
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const ydocRef = useRef(null);

  const handleEditorMounted = (editor, monaco) => {
    console.log("[Mount] Editor mounted with roomId:", roomId);
    editorRef.current = editor;

    // Create Y.Doc
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    console.log("[Yjs] Y.Doc created");

    // Use public signaling server (you can customize this)
    const signalingServers = ["wss://signaling.yjs.dev"];

    // Setup WebrtcProvider
    const provider = new WebrtcProvider(roomId, ydoc, {
      signaling: signalingServers,
    });
    providerRef.current = provider;
    console.log("[WebRTC] Provider initialized");

    // Listen for provider status
    provider.on("status", (event) => {
      console.log("[WebRTC Status]", event.status); // connected / disconnected
    });

    provider.on("synced", (isSynced) => {
      console.log("[WebRTC Synced]", isSynced); // true if synced with peers
    });

    // Awareness update logs
    provider.awareness.on("update", ({ added, updated, removed }) => {
      console.log("[Awareness] Added:", added, "Updated:", updated, "Removed:", removed);
    });

    // Get shared Y.Text type
    const yText = ydoc.getText("monaco");

    // If editor has no model, create one
    if (!editor.getModel()) {
      const model = monaco.editor.createModel("", language);
      editor.setModel(model);
      console.log("[Monaco] Model created and set");
    }

    // Bind Yjs text with Monaco editor model
    new MonacoBinding(yText, editor.getModel(), new Set([editor]), provider.awareness);
    console.log("[Binding] MonacoBinding created");

    // Insert initial text if empty to trigger sync
    if (yText.length === 0) {
      yText.insert(0, `// Collaborative code editing room: ${roomId}\n`);
    }
  };

  // Language change handler
  const onSelect = (newLanguage) => {
    if (editorRef.current) {
      const oldModel = editorRef.current.getModel();
      const currentValue = oldModel.getValue();

      oldModel.dispose();

      // Create new model with same content but different language
      const newModel = window.monaco.editor.createModel(currentValue, newLanguage);
      editorRef.current.setModel(newModel);
    }
    setLanguage(newLanguage);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (providerRef.current) {
        console.log("[Cleanup] Destroying WebRTC provider");
        providerRef.current.destroy();
      }
      if (ydocRef.current) {
        console.log("[Cleanup] Destroying Y.Doc");
        ydocRef.current.destroy();
      }
    };
  }, []);

  return (
    <Box padding={10}>
      <HStack spacing={4} alignItems="start">
        <Box w="50%">
          <LanguageSelector language={language} onSelect={onSelect} />
          <Editor
            height="75vh"
            theme="vs-dark"
            language={language}
            onMount={handleEditorMounted}
            options={{
              fontSize: 14,
              automaticLayout: true,
            }}
          />
        </Box>
        <Output editorRef={editorRef} language={language} />
      </HStack>
    </Box>
  );
};

export default CodeEditor;
