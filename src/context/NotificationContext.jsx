// src/context/NotificationContext.jsx
import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({ message: '', type: '', show: false });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification.show && <Notification message={notification.message} type={notification.type} />}
    </NotificationContext.Provider>
  );
};

const Notification = ({ message, type }) => {
  // Colores adaptados a la marca SnackBox
  const baseStyle = "fixed top-5 right-5 p-4 rounded-lg shadow-xl text-white flex items-center transition-transform transform translate-x-0";
  const successStyle = "bg-green-500";
  const errorStyle = "bg-red-500";
  const typeStyle = type === 'success' ? successStyle : errorStyle;

  return (
    <div className={`${baseStyle} ${typeStyle} animate-slide-in z-50`}>
      {message}
    </div>
  );
};