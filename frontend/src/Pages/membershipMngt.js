
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_KEY = process.env.REACT_APP_API_KEY;

const MembershipManagement = () => {

  return (
     <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-700">
      <div className="text-center">
        <i className="bi bi-person-lock text-5xl text-gray-600 mb-4"></i>
        <p className="text-lg font-medium">Sorry, you have not yet activated this service.</p>
      </div>
    </div>
  );
};

export default MembershipManagement;
