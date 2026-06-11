import { createContext, useContext, useState } from "react";

interface AppContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  theme: string;
  setTheme: React.Dispatch<React.SetStateAction<string>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("light");

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <AppContext.Provider
      value={{
        sidebarOpen,
        toggleSidebar,
        loading,
        setLoading,
        theme,
        setTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}
