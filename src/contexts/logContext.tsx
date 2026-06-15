import { createContext, useContext, useState } from "react";

const LogContext = createContext<{
  log: (message: string) => void,
  logContent: string[]
} | null>(null);

export function LogProvider({ children }: { children: React.ReactNode }) {
  const [logContent, setLogContent] = useState<string[]>([]);

  const log = (msg: string) => {
    setLogContent(prev => [...prev, new Date().toLocaleTimeString() + " | " + msg]);
  };

  return (
    <LogContext.Provider value={{ log, logContent }}>{/* ✅ added logContent */}
      {children}
    </LogContext.Provider>
  );
}

export const useLog = () => useContext(LogContext)!;
