import './App.css';
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from './Pages/login';
import CouponPage from './Pages/admin';
import Dashboard from './Pages/dashboard';
import './i18n';

function App() {
  return (
    <div className="App">
      <Routes>
          <Route exact path='/' element={<Login />} />
          <Route path='/admin-panel' element={<CouponPage />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
    </div>
  );
}

export default App;
