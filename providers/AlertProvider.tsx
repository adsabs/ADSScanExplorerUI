import React, { useState, useCallback } from 'react';

export const AlertContext = React.createContext({
    alert: null,
    addError: (message) => {},
    addMessage: (message) => {},
    removeAlert: () => {}
  });


  type AlertProviderProps = {
    children: React.ReactNode
}

/**
 * Provider used to create new alerts.
 */    
const AlertProvider = ({ children }: AlertProviderProps) => {
    const [alert, setAlert] = useState(null);

    const removeAlert = () => setAlert(null);
    const addError = (message: string) => setAlert({ message: message, isError: true });
    const addMessage = (message: string) => setAlert({ message: message, isError: false})

    const contextValue = {
        alert,
        addError: useCallback((message) => addError(message), []),
        addMessage: useCallback((message) => addMessage(message), []),
        removeAlert: useCallback(() => removeAlert(), [])
      };

      return (
        <AlertContext.Provider value={contextValue}>
          {children}
        </AlertContext.Provider>
      );
}


export default AlertProvider