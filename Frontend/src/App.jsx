import { BrowserRouter, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import HomePage from './pages/HomePage'
import Chat from './pages/Chat'
function App() {

  return (
    <BrowserRouter >
    <Routes>
      <Route path='/home' element={<HomePage />}></Route>
      <Route path='/chat' element={<Chat />}></Route>
    </Routes>
    </BrowserRouter >
  )
}

export default App
