
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_KEY = process.env.REACT_APP_API_KEY;

const MembershipManagement = () => {

  return (
    <div className="flex items-center justify-center bg-gray-100">
        This is membership management center page (under construction)
        current user: {Cookies.get('username')}
    </div>
  );
};

export default MembershipManagement;
