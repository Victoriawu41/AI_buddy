import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import HomePage from './pages/HomePage'
import Chat from './pages/Chat'
import Calendar from './pages/Calendar';

function App() {

  return (
    <BrowserRouter >
    <Routes>
      <Route path='/home' element={<HomePage />}></Route>
      <Route path='/chat' element={<Chat />}></Route>
      <Route path='/calendar' element={<Calendar />}></Route>
    </Routes>
    </BrowserRouter >
  )
}

export default App
