import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

const QRScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null); // 用于保存视频流

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

        streamRef.current = stream; // 保存视频流
        videoRef.current.srcObject = stream;

        // 确保视频加载完成后再播放
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch((err) => {
            console.error('视频播放失败:', err);
            setError('视频播放失败，请检查设备设置。');
          });
        };

        // 解码二维码
        codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result) => {
          if (result) {
            setScanResult(result.getText());
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
      // 停止摄像头流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">扫描二维码</h1>
      <div className="w-full max-w-md bg-white p-4 shadow rounded">
        <video ref={videoRef} className="w-full" muted /> {/* 确保静音，避免音频问题 */}
        {scanResult && <p className="mt-4 text-green-500">扫描结果: {scanResult}</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default QRScanner;
