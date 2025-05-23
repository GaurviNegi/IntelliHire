
import { createContext, useState, useEffect, useRef } from "react";

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const defaultTime = 1800; // 30 minutes

  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const timerRef = useRef(null);

  // Start countdown when component mounts
  useEffect(() => {
    if (timeLeft <= 0) {
      localStorage.removeItem("timeLeft");
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            localStorage.removeItem("timeLeft");
            return 0;
          }
          const newTime = prev - 1;
          localStorage.setItem("timeLeft", newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft]);

  // Reset timer when user submits the test
  const resetTimer = () => {
    localStorage.removeItem("timeLeft");
    setTimeLeft(defaultTime);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <TimerContext.Provider value={{ timeLeft, resetTimer }}>
      {children}
    </TimerContext.Provider>
  );
};


