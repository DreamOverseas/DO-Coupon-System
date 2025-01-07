import './App.css';
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from './Pages/login';
import Admin from './Pages/admin';
import QRScanner from './Pages/QRScanner';

function App() {
  return (
    <div className="App">
      <Routes>
          <Route exact path='/' element={<Login />} />
          <Route path='/admin-panel' element={<Admin />} />
          <Route path='/provider-panel' element={<QRScanner />} />
        </Routes>
    </div>
  );
}

export default App;
