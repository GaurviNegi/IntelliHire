import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TestScreen from "./pages/TestScreen";
import { TimerProvider } from "./context/TimerContext";
import Homepage from "./pages/HomePage";
import ProctoredTest from "./pages/ProctoredTest";
import PrivateRoute from "./components/PrivateRoute"; // Import PrivateRoute
import AppRoutes from "./round2-call/AppRoutes"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        
        {/* These routes check both authentication and test attempt */}
        <Route path="/proctored-test" element={<PrivateRoute element={<ProctoredTest />} checkTestAttempt={true} />} />
        <Route path="/test-start" element={<PrivateRoute element={<TimerProvider><TestScreen /></TimerProvider>} checkTestAttempt={true} />} />
        
        {/* Future interview route: Only checks authentication */}
        <Route path="/round2/*" element={ <AppRoutes /> }/>
        
      </Routes>
    </Router>
  );
}

export default App;

