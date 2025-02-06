import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


import LoginPage from "./pages/LoginPage";
import HomePage from './pages/HomePage'
import Chat from './pages/Chat'
import Calendar from './pages/Calendar';
import NavBar from './Components/Calendar/Navbar';

function App() {
  return (

    <BrowserRouter >
      <NavBar />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path='/home' element={<HomePage />}></Route>
        <Route path='/chat' element={<Chat />}></Route>
        <Route path='/calendar' element={<Calendar />}></Route>
      </Routes>
    </BrowserRouter >
  );

}

export default App;
