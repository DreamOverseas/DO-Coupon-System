import React, { useEffect } from "react";
import Cookies from 'js-cookie';

const CouponMgnt = () => {

    useEffect(() => {
        // Ensure only Provider role can view this page
        const role = Cookies.get('role');
        if (role === 'Admin') {
            window.location.href = '/admin-panel';
        } else if (role !== 'Provider') {
            console.error("Unknown Status: Role.");
            window.location.href = '/';
        }
    }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <h1>Place Holder for Provider's management page: ||| </h1> <br />
            <div>
                <a href="/admin-panel">Admin Page</a> | <a href="/my-coupon-management/scan">Scan QR</a>
            </div>
            |||
        </div>
    );
};

export default CouponMgnt;
