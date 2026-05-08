import React, { createContext, useContext, useState, ReactNode } from 'react';

type NavigationContextType = {
  currentPage: string;
  subPage?: string;
  navigate: (page: string, subPage?: string) => void;
};

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [subPage, setSubPage] = useState<string | undefined>(undefined);

  const navigate = (page: string, newSubPage?: string) => {
    setCurrentPage(page);
    setSubPage(newSubPage);
  };

  return (
    <NavigationContext.Provider value={{ currentPage, subPage, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
