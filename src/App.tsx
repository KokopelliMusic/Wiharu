import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Player from './pages/Player'


function App() {
  return <div>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="player" element={<Player />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </div>
}

export default App
