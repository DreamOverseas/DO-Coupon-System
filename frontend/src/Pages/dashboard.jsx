import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import QRScanner from './QRScanner';
import { useNavigate } from 'react-router-dom';
import Overview from './overview';
import History from './history';
import MembershipManagement from './membershipMngt';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const MembershipField = Cookies.get('membershipField');

    const { t, i18n } = useTranslation();

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
            case 'membership':
                return <MembershipManagement />;
            default:
                return <div className="p-4">请选择一个栏目 | Please Select a section from the NavBar below</div>;
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
                    <span className="hidden sm:block text-lg font-bold">{t("dashboard.title")}</span>
                </div>
                <div className="text-sm font-medium">{t("dashboard.greet")} {username}. </div>
                <div>
                    <button 
                        className='bg-amber-500 hover:bg-amber-700 text-white text-sm font-bold py-2 px-4 mr-2 rounded' 
                        onClick={toggleLang}>
                        <div className='min-w-12'>
                        {getLangText(i18n.language)} <i class="bi bi-arrow-clockwise"></i>
                        </div>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded"
                    >
                        {t("dashboard.logout")}
                    </button>
                </div>
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
                    <i className={`bi bi-view-list text-2xl transition-opacity ${activeTab === 'overview' ? 'text-lime-400' : 'text-white'}`}></i>
                    <p className={`mt-1 block ${activeTab === 'overview' ? 'font-bold' : 'font-normal'}`}>{t("dashboard.overview")}</p>
                </button>

                <button
                    className="flex flex-col items-center text-xs focus:outline-none"
                    onClick={() => setActiveTab('scanner')}
                >
                    <i className={`bi bi-qr-code-scan text-2xl transition-opacity ${activeTab === 'scanner' ? 'text-blue-400' : 'text-white'}`}></i>
                    <p className={`mt-1 block ${activeTab === 'scanner' ? 'font-bold' : 'font-normal'}`}>{t("dashboard.coupon_scan")}</p>
                </button>

                {MembershipField && MembershipField !== 'null' && MembershipField !== 'undefined' && MembershipField.trim() !== '' && (
                    <button
                        className="flex flex-col items-center text-xs focus:outline-none"
                        onClick={() => setActiveTab('membership')}
                    >
                        <i className={`bi bi-person-bounding-box text-2xl transition-opacity ${activeTab === 'membership' ? 'text-violet-400' : 'text-white'}`}></i>
                        <p className={`mt-1 block ${activeTab === 'membership' ? 'font-bold' : 'font-normal'}`}>{t("dashboard.membership_verify")}</p>
                    </button>
                )}

                <button
                    className="flex flex-col items-center text-xs focus:outline-none"
                    onClick={() => setActiveTab('history')}
                >
                    <i className={`bi bi-clock-history text-2xl transition-opacity ${activeTab === 'history' ? 'text-amber-300' : 'text-white'}`}></i>
                    <p className={`mt-1 block ${activeTab === 'history' ? 'font-bold' : 'font-normal'}`}>{t("dashboard.history")}</p>
                </button>
            </footer>

        </div>
    );
};

export default Dashboard;
