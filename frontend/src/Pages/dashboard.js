import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import QRScanner from './QRScanner';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview'); // 当前选中的栏目
    const [username, setUsername] = useState('');

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
                return <div className="p-4">卡券一览的内容 (Coupon Overview Content)</div>;
            case 'scanner':
                return <QRScanner />;
            case 'history':
                return <div className="p-4">使用历史的内容 (Coupon History Content)</div>;
            default:
                return <div className="p-4">请选择一个栏目</div>;
        }
    };

    return (
        <div className="flex flex-col h-screen">
            {/* 顶部横向导航栏 */}
            <header className="bg-gray-800 text-white py-4 px-6 flex items-center justify-between shadow-md">
                <div className="flex items-center space-x-4">
                    <img src="/logo512.png" alt="Logo" className="h-10 w-10" />
                    <span className="text-lg font-bold">DO Coupon System - Client</span>
                </div>
                <div className="text-sm font-medium">Welcome, {username}</div>
            </header>

            {/* 主内容区域 */}
            <main className="flex-1 bg-gray-100">{renderContent()}</main>

            {/* 底部导航栏 */}
            <footer className="bg-gray-800 text-white py-3 px-4 flex justify-around items-center shadow-md">
                <button
                    className={`text-sm ${activeTab === 'overview' ? 'font-bold underline' : 'font-medium'
                        }`}
                    onClick={() => setActiveTab('overview')}
                >
                    卡券一览 / Coupon Overview
                </button>
                <button
                    className={`text-sm ${activeTab === 'scanner' ? 'font-bold underline' : 'font-medium'
                        }`}
                    onClick={() => setActiveTab('scanner')}
                >
                    扫描卡券 / Scan Coupon
                </button>
                <button
                    className={`text-sm ${activeTab === 'history' ? 'font-bold underline' : 'font-medium'
                        }`}
                    onClick={() => setActiveTab('history')}
                >
                    使用历史 / Coupon History
                </button>
            </footer>
        </div>
    );
};

export default Dashboard;
