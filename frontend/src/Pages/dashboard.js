import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import QRScanner from './QRScanner';
import { useNavigate } from 'react-router-dom';
import Overview from './overview';
import History from './history';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 当前选中的栏目
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

    // 切换栏目的内容
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
        // 删除所有 Cookies
        Cookies.remove('username');
        Cookies.remove('role');
        navigate('/'); // 跳转到首页
    };

    return (
        <div className="flex flex-col h-screen">
            {/* 顶部横向导航栏 */}
            <header className="bg-gray-800 text-white py-4 px-6 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-4">
                    <img src="/logo-wh.png" alt="Logo" className="h-10 w-10" />
                    <span className="text-lg font-bold">DO Coupon System - Client</span>
                </div>
                <div className="text-sm font-medium">Welcome, {username}</div>
                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded"
                >
                    登出 / Logout
                </button>
            </header>

            {/* 主内容区域 */}
            <main className="flex-1 bg-gray-100">{renderContent()}</main>

            {/* 底部导航栏 */}
            <footer className="bg-gray-800 text-white py-3 px-4 flex justify-around items-center shadow-md">
                <button
                    className={`text-sm ${activeTab === 'overview' ? 'font-bold' : 'font-medium'
                        }`}
                    onClick={() => setActiveTab('overview')}
                >
                    <i class="bi bi-view-list"></i> <br />
                    卡券一览 / Coupon Overview
                </button>
                <button
                    className={`text-sm ${activeTab === 'scanner' ? 'font-bold' : 'font-medium'
                        }`}
                    onClick={() => setActiveTab('scanner')}
                >
                    <i class="bi bi-qr-code-scan"></i> <br />
                    扫描卡券 / Scan Coupon
                </button>
                <button
                    className={`text-sm ${activeTab === 'history' ? 'font-bold' : 'font-medium'
                        }`}
                    onClick={() => setActiveTab('history')}
                >
                    <i class="bi bi-clock-history"></i> <br />
                    使用历史 / Coupon History
                </button>
            </footer>
        </div>
    );
};

export default Dashboard;
