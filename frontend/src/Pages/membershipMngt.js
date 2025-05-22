import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_KEY = process.env.REACT_APP_API_KEY;

const MembershipField = Cookies.get('membershipField');

const MembershipManagement = () => {
  const [scanResult, setScanResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [videoDevices, setVideoDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [memberData, setMemberData] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReaderRef = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    const initScanner = async () => {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      codeReaderRef.current = new BrowserMultiFormatReader(hints);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputDevices);

        const selectedDeviceId = videoInputDevices[currentDeviceIndex]?.deviceId;
        if (!selectedDeviceId) {
          setErrorMsg('摄像头未检测到，请检查设备摄像头访问权限');
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: selectedDeviceId },
        });

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();

        codeReaderRef.current.decodeOnceFromVideoDevice(selectedDeviceId, videoRef.current)
          .then(result => handleScan(result.getText().trim()))
          .catch(err => {
            console.error('扫描失败:', err);
            restartScanner();
          });

      } catch (err) {
        console.error('摄像头初始化失败:', err);
        setErrorMsg('摄像头初始化失败，请检查设备摄像头访问权限');
      }
    };

    initScanner();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (codeReaderRef.current && typeof codeReaderRef.current.reset === 'function') {
        codeReaderRef.current.reset();
      }
    };
  }, [currentDeviceIndex]);

  const handleScan = async (data) => {
    if (!data) return;
    setScanResult(data);

    try {
      const res = await axios.get(`${API_ENDPOINT}/${MembershipField}?filters[MembershipNumber][$eq]=${scanResult}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        params: {
          filters: {
            MembershipNumber: {
              $eq: data
            }
          }
        }
      });

      const results = res.data.data;

      if (!results || results.length === 0) {
        setErrorMsg('Member Not found | 未找到会员');
        setScanResult('');
        restartScanner();
      } else if (results.length > 1) {
        setErrorMsg('Invalid QR data | 无效二维码信息');
        setScanResult('');
        restartScanner();
      } else {
        setMemberData(results[0]);
        setErrorMsg('');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Error fetching Membership data | 读取会员信息失败');
      setScanResult('');
      restartScanner();
    }
  };

  const restartScanner = async () => {
    const selectedDeviceId = videoDevices[currentDeviceIndex]?.deviceId;
    if (!codeReaderRef.current || !selectedDeviceId) return;

    try {
      if (typeof codeReaderRef.current.reset === 'function') {
        codeReaderRef.current.reset();
      } else {
        console.warn('codeReaderRef.current.reset is not a function');
      }
      codeReaderRef.current.decodeOnceFromVideoDevice(selectedDeviceId, videoRef.current)
        .then(result => handleScan(result.getText().trim()))
        .catch(err => {
          console.error('重启扫描器失败:', err);
        });
    } catch (err) {
      console.error('重启失败:', err);
    }
  };

  const handleSwitchCamera = () => {
    if (videoDevices.length > 1) {
      setCurrentDeviceIndex((currentDeviceIndex + 1) % videoDevices.length);
      setErrorMsg('');
    }
  };

  const closeError = () => setErrorMsg('');
  const closeDetails = () => {
    setScanResult('');
    setMemberData(null);
    restartScanner();
  };

  return (
    MembershipField && MembershipField === 'null' ?
      <div className="flex items-center justify-center min-h-screen bg-gray-100 text-gray-700">
        <div className="text-center">
          <i className="bi bi-person-lock text-5xl text-gray-600 mb-4"></i>
          <p className="text-lg font-medium">Sorry, you have not yet activated this service.</p>
        </div>
      </div>
      :
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">Scan Membership QR Code</h1>

        <div className="w-full max-w-sm bg-white p-4 shadow rounded">
          <video ref={videoRef} className="w-full" muted></video>
        </div>

        <button
          onClick={handleSwitchCamera}
          className={`mt-4 ${videoDevices.length > 1 ? 'bg-blue-500 hover:bg-blue-700' : 'bg-gray-400'} text-white font-bold py-2 px-4 rounded`}
          disabled={videoDevices.length <= 1}
        >
          Switch Camera | 切换摄像头
        </button>

        {errorMsg && (
          <div className="fixed top-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg animate-fade-in z-50">
            <div className="flex items-center">
              <i className="bi bi-x-circle text-xl mr-2"></i>
              <span>{errorMsg}</span>
              <button onClick={closeError} className="ml-4 text-red-700">✕</button>
            </div>
          </div>
        )}

        {memberData && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 max-w-md max-h-[90vh] w-full overflow-auto animate-zoom-in z-50">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h2 className="text-xl font-bold text-center w-full">Member Details</h2>
              <button onClick={closeDetails} className="text-gray-500 text-xl absolute top-4 right-4">×</button>
            </div>
            <p><strong>Membership Number:</strong> {memberData.MembershipNumber}</p>
            <p><strong>Email:</strong> {memberData.Email}</p>
            <p><strong>Expiry Date:</strong> {memberData.ExpiryDate}</p>

            <div className="mt-4 overflow-y-auto">
              {/* Placeholder for future functions */}
              <div className="h-32 bg-gray-50 rounded border border-dashed flex items-center justify-center text-gray-400">
                Additional Features Coming Soon...
              </div>
            </div>
          </div>
        )}
      </div>
  );
};

export default MembershipManagement;
