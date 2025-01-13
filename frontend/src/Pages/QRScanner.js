import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from 'axios';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState(null);
  const [couponStatus, setCouponStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const BACKEND_API = process.env.REACT_APP_BACKEND_API;

  useEffect(() => {
    const initScanner = async () => {
      const codeReader = new BrowserMultiFormatReader();

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter((device) => device.kind === 'videoinput');

        if (videoInputDevices.length === 0) {
          setError('未检测到摄像头，请检查设备权限。');
          return;
        }

        const selectedDeviceId = videoInputDevices[0].deviceId;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedDeviceId },
        });

        streamRef.current = stream;
        videoRef.current.srcObject = stream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.error('视频播放失败:', err);
            setError('视频播放失败，请检查设备设置。');
          });
        };

        codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result) => {
          if (result) {
            handleScan(result.getText());
            setError(null);
          }
        });
      } catch (err) {
        console.error('摄像头初始化失败:', err);
        setError('摄像头初始化失败，请检查设备设置。');
      }
    };

    initScanner();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = async (data) => {
    if (!data) return;
    setScanResult(data);
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_API}/validate-coupon`, { hash: data });
      setCouponStatus(response.data);
    } catch (error) {
      console.error('验证失败:', `尝试连接${BACKEND_API}/validate-coupon`, error);
      setCouponStatus({ status: 'invalid', message: '与云端失去连接，请尝试其他验证方法' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmUse = async () => {
    if (!couponStatus || couponStatus.status !== 'valid') return;

    try {
      const response = await axios.post(`${BACKEND_API}/use-coupon`, { hash: scanResult });
      setCouponStatus(response.data);
    } catch (error) {
      console.error('使用失败:', `尝试连接${BACKEND_API}/use-coupon`, error);
      alert('确认使用时发生错误，请重试。');
    }
  };

  const renderIcon = () => {
    if (!couponStatus) return null;

    if (
      couponStatus.status === 'invalid' ||
      couponStatus.status === 'expired' ||
      couponStatus.status === 'used' ||
      couponStatus.status === 'inactive'
    ) {
      return <i className="bi bi-x-circle-fill text-red-500 text-5xl"></i>;
    }

    if (couponStatus.status === 'valid') {
      return <i className="bi bi-check-circle-fill text-green-500 text-5xl"></i>;
    }

    return null;
  };

  const renderCouponDetails = () => {
    if (!couponStatus) return null;

    if (couponStatus.status === 'valid') {
      return (
        <>
          <p className="text-green-500 mt-2 text-lg">{couponStatus.title}</p>
          <p className="text-gray-500 mt-1 text-sm">{couponStatus.description}</p>
          <button
            onClick={handleConfirmUse}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            确认使用
          </button>
        </>
      );
    }

    return <p className="text-red-500 mt-2">{couponStatus.message}</p>;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">扫描二维码 / Scan QR code</h1>
      <div className="w-full max-w-md bg-white p-4 shadow rounded">
        <video ref={videoRef} className="w-full" muted />
        {scanResult && !loading && renderIcon()}
        {scanResult && !loading && renderCouponDetails()}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default QRScanner;
