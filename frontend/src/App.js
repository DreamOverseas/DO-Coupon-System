import './App.css';
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from './Pages/login';
import Admin from './Pages/admin';
import QRScanner from './Pages/QRScanner';
import CouponMgnt from './Pages/myCouponMgnt';

function App() {
  return (
    <div className="App">
      <Routes>
          <Route exact path='/' element={<Login />} />
          <Route path='/admin-panel' element={<Admin />} />
          <Route path='/my-coupon-management' element={<CouponMgnt />} />
          <Route path='/my-coupon-management/scan' element={<QRScanner />} />
        </Routes>
    </div>
  );
}

export default App;
