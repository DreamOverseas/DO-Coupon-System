import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader'; // 确保库名和导入方式正确
import axios from 'axios';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState(null);

  const videoConstraints = {
    facingMode: 'environment', // 使用后置摄像头
  };

  const handleScan = async (data) => {
    if (data) {
      setScanResult(data);
      try {
        const response = await axios.post('/api/validate-coupon', { hash: data });
        console.log('Coupon status:', response.data);
      } catch (err) {
        setError('无法验证优惠券，请重试。');
      }
    }
  };

  const handleError = (err) => {
    console.error('QR Reader Error:', err);
    setError('摄像头访问失败，请检查权限或设备设置。');
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-xl font-bold mb-4">扫描二维码</h1>
      <QrReader
        onResult={(result, error) => {
          if (!!result) {
            handleScan(result.text);
          }
          if (!!error) {
            handleError(error);
          }
        }}
        constraints={{}} // 指定摄像头设置
        style={{ width: '100%' }}
      />
      {scanResult && <p className="mt-4">扫描结果：{scanResult}</p>}
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default QRScanner;
