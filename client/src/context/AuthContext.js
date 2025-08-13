import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../socket';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const[socket,setSocket]=useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = (userData, token) => {
    setUser(userData);
    setToken(token);
    if (userData) {

      const s = getSocket();
      setSocket(s);
    }
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('userId')
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('id');

  };

  useEffect(() => {
    // Clean up the socket connection when the component unmounts
    return () => {
      socket.disconnect();
    };
  }, [socket]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 