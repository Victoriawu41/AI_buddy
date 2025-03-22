import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import { reminderService } from './utils/eventReminders';
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import Chat from "./pages/Chat";
import Calendar from "./pages/CalendarPage";
import PrivateRoute from "./Components/PrivateRoute";
import Toast from './components/Toast';
import Logout from "./Components/Logout";

function App() {
  useEffect(() => {
    reminderService.start();
    return () => reminderService.stop();
  }, []);

  return (
    <BrowserRouter>
      <Toast /> {/* Add Toast component here */}
      <Routes>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="/login" element={<LoginPage />}></Route>

        <Route
          path="/home"
          element={<HomePage />}
        ></Route>
        <Route path="/chat" element={<PrivateRoute element={Chat} />}></Route>
        <Route
          path="/calendar"
          element={<PrivateRoute element={Calendar} />}
        ></Route>
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
