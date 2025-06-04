import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import axios from 'axios';
import Cookies from 'js-cookie';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState(null);
  const [couponStatus, setCouponStatus] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(1);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const username = Cookies.get('username');
  const BACKEND_API = process.env.REACT_APP_BACKEND_API;

  useEffect(() => {
    const initScanner = async () => {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      const codeReader = new BrowserMultiFormatReader(hints);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter((device) => device.kind === 'videoinput');

        if (videoInputDevices.length === 0) {
          setError('未检测到摄像头，请检查设备权限。');
          return;
        }

        // reset to 0 if only 1 device is detected
        if (videoInputDevices.length === 1 && currentDeviceIndex !== 0) {
          setCurrentDeviceIndex(0);
          return;
        }

        setVideoDevices(videoInputDevices);

        const selectedDeviceId = videoInputDevices[currentDeviceIndex].deviceId;

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

        if (!scanResult || scanResult === '') {
          codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result) => {
            if (result) {
              handleScan(result.getText());
              setError(null);
            }
          });
        }
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
  }, [currentDeviceIndex]);

  const handleScan = async (data) => {
    if (!data) return;
    if (scanResult !== '') return;
    setScanResult(data);

    try {
      const response = await axios.post(`${BACKEND_API}/validate-coupon`, { hash: data, provider: username });
      setCouponStatus(response.data);
    } catch (error) {
      console.error('验证失败:', `尝试连接${BACKEND_API}/validate-coupon`, error);
      setCouponStatus({ status: 'invalid', message: '与云端失去连接，请尝试其他验证方法' });
    }
  };

  const handleConfirmUse = async () => {
    if (!couponStatus || couponStatus.status !== 'valid') return;

    try {
      const response = await axios.post(`${BACKEND_API}/use-coupon`, { hash: scanResult, username });
      setCouponStatus(response.data);
    } catch (error) {
      console.error('使用失败:', `尝试连接${BACKEND_API}/use-coupon`, error);
      alert('确认使用时发生错误，请重试。');
    }
  };

  const handleSwitchCamera = async () => {
    if (videoDevices.length <= 1) return;

    const nextDeviceIndex = (currentDeviceIndex + 1) % videoDevices.length; // Loop thru available device
    setCurrentDeviceIndex(nextDeviceIndex);
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
          <p className="text-gray-500 mt-1 text-sm max-h-[75px] overflow-y-auto">
            {couponStatus.description}
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setScanResult('')}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              重新扫描
            </button>

            <button
              onClick={handleConfirmUse}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              确认使用
            </button>
          </div>
        </>
      );
    }

    return <p className="text-red-500 mt-2">{couponStatus.message}</p>;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100">

      <h1 className="text-2xl font-bold mb-4">扫描二维码 / Scan QR</h1>
      <div className="w-full max-w-md bg-white p-4 shadow rounded">
        <div className="relative w-full max-w-md mx-auto">
          <video
            ref={videoRef}
            className="w-full aspect-square object-cover bg-black"
            muted
          />
          <svg
            className="absolute inset-0 w-full h-full text-amber-200 opacity-50 pointer-events-none"
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
          >
            <path d="M20 50 V20 H50" strokeWidth="4" />
            <path d="M150 20 H180 V50" strokeWidth="4" />
            <path d="M180 150 V180 H150" strokeWidth="4" />
            <path d="M50 180 H20 V150" strokeWidth="4" />
          </svg>
        </div>
        {scanResult && renderIcon()}
        {scanResult && renderCouponDetails()}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      <button
        onClick={handleSwitchCamera}
        className={`mt-4 ${videoDevices.length > 1 ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-400'
          } text-white font-bold py-2 px-4 rounded`}
        disabled={videoDevices.length <= 1}
      >
        切换摄像头 / Switch Camera
      </button>
    </div>
  );
};

export default QRScanner;
