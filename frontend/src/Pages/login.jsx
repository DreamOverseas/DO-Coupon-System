
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import DoTermsAndConditions from '../Components/DoTermsAndConditions';
import { useTranslation } from 'react-i18next';

const BACKEND_API = import.meta.env.VITE_BACKEND_API;

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const API_KEY = import.meta.env.VITE_API_KEY;

// Check if the Cookie still have valid records.
const isAccountValid = async (name, role) => {
  if (!name || !role) {
    console.log("Checking Cookie: Missing field.");
    return false;
  }
  try {
    // Query Strapi for the account by name
    const response = await axios.get(`${API_ENDPOINT}/coupon-sys-accounts`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      },
      params: {
        filters: {
          Name: {
            $eq: name
          },
          Role: {
            $eq: role
          },
        }
      }
    });
    const accounts = response.data.data;

    if (accounts.length === 0) {
      console.log("Checking Cookie: Account detail check failed.");
      return false;
    }

    if (accounts.length > 1) {
      console.log("Checking Cookie: Too many account matches.");
      return false;
    }

    const account = accounts[0];

    if (account.CurrentStatus !== "active") {
      console.log("Checking Cookie: Account nolonger active.");
      return false;
    }

    // Double Checks
    if (account.Role === role) {
      console.log("Checking Cookie: Passed.");
      return true;
    } else {
      console.log("Checking Cookie: Role does not match.");
      return false;
    }
  } catch (error) {
    console.error('Error during cookie check:', error);
    return false;
  }
}

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { t, i18n } = useTranslation();

  useEffect(() => {
    // Check for existing cookie and redirect if logged in
    const role = Cookies.get('role');
    const username = Cookies.get('username');

    if (!isAccountValid(username, role)) {
      return;
    }
    else {
      if (role === 'Admin') {
        window.location.href = '/admin-panel';
      } else if (role === 'Provider') {
        window.location.href = '/dashboard';
      }
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const toggleLang = () => {
    if (i18n.language == 'zh') {
      i18n.changeLanguage('en');
      return;
    }
    if (i18n.language == 'en') {
      i18n.changeLanguage('zh');
      return;
    }
  }

  function getLangText() {
    if (i18n.language == 'en') {
      return "中文";
    }
    if (i18n.language == 'zh') {
      return "English";
    }
  }

  const handleLogin = async () => {
    if (!name || !password) {
      setErrorMessage('用户名和密码都是必填项！');
      return;
    }

    try {
      const response = await axios.post(`${BACKEND_API}/login`, { name, password });
      const { role, membershipField, message } = response.data;

      if (role === 'none') {
        setErrorMessage(message);
      } else {
        // Set cookies for 7 days
        Cookies.set('username', name, { expires: 7 });
        Cookies.set('role', role, { expires: 7 });
        Cookies.set('membershipField', membershipField, { expires: 7 });

        // Redirect based on role
        if (role === 'Admin') {
          window.location.href = '/admin-panel';
        } else {
          window.location.href = '/dashboard';
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        // Extract error message from response if available
        setErrorMessage(error.response.data.message || '登录失败，请检查登录信息，稍后再试。');
      } else {
        setErrorMessage('登录失败，请稍后再试。');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100"
      onKeyDown={handleKeyDown}
    >
      <div className="w-full max-w-md p-8 bg-white rounded shadow-md relative">
        <button 
          className='absolute rounded p-1 bg-amber-500/50 top-2 right-2 z-50'
          type='button' onClick={toggleLang} >
            <div className='min-w-12'>
            {getLangText(i18n.language)}<i class="bi bi-arrow-clockwise" ></i>
            </div>
        </button>
        <div className='min-h-16 flex justify-center align-middle mt-2'>
          <h1 className="text-2xl font-bold text-center">{t("login.title")}</h1>
        </div>
        <h4 className="text-lg font-medium text-center text-gray-500 mt-2">===================</h4>

        {errorMessage && (
          <div className="mt-4 text-red-500 text-center">{errorMessage}</div>
        )}

        <div className="mt-6">
          <label className="block text-left text-gray-700">{t("login.username")}</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 mt-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4">
          <label className="block text-left text-gray-700">{t("login.pwd")}</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 mt-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className='text-sm text-gray-700 mt-2 text-right'>
          {t("login.readtc")} <DoTermsAndConditions defaultLang={i18n.language}/>
        </div>

        <button
          onClick={handleLogin}
          className="w-full px-4 py-2 mt-1 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
        >
          {t("login.loginbtn")}
        </button>
      </div>
    </div>
  );
};

export default Login;
