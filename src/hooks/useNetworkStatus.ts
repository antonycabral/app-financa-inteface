import { useEffect, useState } from 'react';

let isNetworkAvailable = true;

// Verificação simples de conectividade
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Verificar conectividade quando o app monta
    checkConnectivity();

    // Listener para quando o app volta do background
    const checkInterval = setInterval(() => {
      checkConnectivity();
    }, 5000);

    return () => clearInterval(checkInterval);
  }, []);

  const checkConnectivity = async () => {
    try {
      const response = await fetch('http://8.8.8.8', { method: 'HEAD' });
      isNetworkAvailable = true;
      setIsOnline(true);
    } catch {
      isNetworkAvailable = false;
      setIsOnline(false);
    }
  };

  return { isOnline, checkConnectivity };
};

export const getNetworkStatus = () => isNetworkAvailable;
