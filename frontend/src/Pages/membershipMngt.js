
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const BACKEND_API = process.env.REACT_APP_BACKEND_API;
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_KEY = process.env.REACT_APP_API_KEY;

const MembershipManagement = () => {

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        This is membership management center page (under construction)
    </div>
  );
};

export default MembershipManagement;
