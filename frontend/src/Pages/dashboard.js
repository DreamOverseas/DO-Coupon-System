import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import QRScanner from './QRScanner';
import { useNavigate } from 'react-router-dom';
import Overview from './overview';
import History from './history';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();


    useEffect(() => {
        // Ensure only Provider role can view this page
        const role = Cookies.get('role');
        if (role === 'Admin') {
            window.location.href = '/admin-panel';
        } else if (role !== 'Provider') {
            console.error("Unknown Status: Role.");
            window.location.href = '/';
        }
        const storedUsername = Cookies.get('username');
        if (!storedUsername) { console.log("No username read.") }
        setUsername(storedUsername);
    }, []);

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <Overview />;
            case 'scanner':
                return <QRScanner />;
            case 'history':
                return <History />;
            default:
                return <div className="p-4">请选择一个栏目 | Please Select a section from the NavBar below</div>;
        }
    };

    const handleLogout = () => {
        // Del All Cookies
        Cookies.remove('username');
        Cookies.remove('role');
        navigate('/');
    };

    return (
        <div className="flex flex-col h-screen">
            {/* Top info bar */}
            <header className="bg-gray-800 text-white py-4 px-6 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-4">
                    <img src="/logo-wh.png" alt="Logo" className="h-10 w-10" />
                    <span className="text-lg font-bold">DO Coupon Client</span>
                </div>
                <div className="text-sm font-medium">Welcome, {username}. </div>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded"
                >
                    登出 / Logout
                </button>
            </header>

            {/* Main contents */}
            <main className="flex-1 bg-gray-100">{renderContent()}</main>
            <br/><br/>

            {/* Nav Bar-ttom */}
            <footer className="fixed bottom-0 w-full bg-gray-800 text-white py-2 px-4 flex justify-around items-center shadow-md z-50">
                <button
                    className="flex flex-col items-center text-xs focus:outline-none"
                    onClick={() => setActiveTab('overview')}
                >
                    <i className={`bi bi-view-list text-lg transition-opacity ${activeTab === 'overview' ? 'text-lime-400' : 'text-white'}`}></i>
                    <p className={`mt-1 hidden sm:block ${activeTab === 'overview' ? 'font-bold' : 'font-normal'}`}>卡券一览 / Coupon Overview</p>
                </button>

                <button
                    className="flex flex-col items-center text-xs focus:outline-none"
                    onClick={() => setActiveTab('scanner')}
                >
                    <i className={`bi bi-qr-code-scan text-lg transition-opacity ${activeTab === 'scanner' ? 'text-blue-400' : 'text-white'}`}></i>
                    <p className={`mt-1 hidden sm:block ${activeTab === 'scanner' ? 'font-bold' : 'font-normal'}`}>扫描卡券 / Scan Coupon</p>
                </button>

                <button
                    className="flex flex-col items-center text-xs focus:outline-none"
                    onClick={() => setActiveTab('history')}
                >
                    <i className={`bi bi-clock-history text-lg transition-opacity ${activeTab === 'history' ? 'text-amber-300' : 'text-white'}`}></i>
                    <p className={`mt-1 hidden sm:block ${activeTab === 'history' ? 'font-bold' : 'font-normal'}`}>使用历史 / Coupon History</p>
                </button>
            </footer>

        </div>
    );
};

export default Dashboard;
