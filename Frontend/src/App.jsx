import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
