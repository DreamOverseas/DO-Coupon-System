import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader'; // 扫码库
import axios from 'axios';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [couponStatus, setCouponStatus] = useState(null); // 显示优惠券状态
  const [loading, setLoading] = useState(false);

  //Test
  const [data, setData] = useState('No result');

  const BACKEND_API = process.env.REACT_APP_BACKEND_API;

  const handleScan = async (data) => {
    if (!data) return;
    setScanResult(data);
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_API}/validate-coupon`, { hash: data });

      setCouponStatus(response.data); // 接收后端返回的优惠券状态
    } catch (error) {
      setCouponStatus({ status: 'invalid', message: '无效二维码' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUse = async () => {
    if (!couponStatus || couponStatus.status !== 'valid') return;

    try {
      const response = await axios.post(`${BACKEND_API}/use-coupon`, { hash: scanResult });
      setCouponStatus(response.data); // 更新优惠券状态
    } catch (error) {
      alert('确认使用时发生错误，请重试。');
    }
  };

  const renderIcon = () => {
    if (!couponStatus) return null;

    if (couponStatus.status === 'invalid' || couponStatus.status === 'expired' || couponStatus.status === 'used' || couponStatus.status === 'inactive') {
      return <i className="bi bi-x-circle-fill text-red-500 text-5xl"></i>;
    }

    if (couponStatus.status === 'valid') {
      return <i className="bi bi-check-circle-fill text-green-500 text-5xl"></i>;
    }

    return null;
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">扫描二维码</h1>
      <div className="bg-white p-4 shadow-md rounded-md w-96">
        {/* <QrReader onResult={(result) => result?.text && handleScan(result.text)} style={{ width: '100%' }} /> */}

        {/* Test */}
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              setData(result?.text);
            }

            if (!!error) {
              console.info(error);
            }
          }}
          style={{ width: '100%' }}
        />
        <p>{data}</p>

        {loading && <p className="text-gray-500 mt-4">正在验证...</p>}

        {couponStatus && (
          <div className="text-center mt-4">
            {renderIcon()}
            <p className={`mt-2 text-xl ${couponStatus.status === 'valid' ? 'text-green-500' : 'text-red-500'}`}>
              {couponStatus.message}
            </p>
            {couponStatus.status === 'valid' && (
              <>
                <p className="text-gray-700">{couponStatus.title}</p>
                <p className="text-gray-500">{couponStatus.description}</p>
                <button
                  onClick={handleConfirmUse}
                  className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  确认使用
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
