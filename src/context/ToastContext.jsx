import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');

  const notify = useCallback((nextMessage) => {
    setMessage(nextMessage);
    window.setTimeout(() => setMessage(''), 3200);
  }, []);

  const clear = useCallback(() => setMessage(''), []);

  const value = useMemo(() => ({ message, notify, clear }), [clear, message, notify]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider.');
  }
  return context;
}
