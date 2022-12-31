import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NewPlayer from './pages/NewPlayer'
import NotFound from './pages/NotFound'


function App() {
  return <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="player" element={<NewPlayer />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </div>
}

export default App
