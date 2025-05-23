import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import axios from 'axios';
import Cookies from 'js-cookie';

const BACKEND_API = process.env.REACT_APP_BACKEND_API;
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const API_KEY = process.env.REACT_APP_API_KEY;

const MembershipField = Cookies.get('membershipField');

const MembershipManagement = () => {
  const [scanResult, setScanResult] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [videoDevices, setVideoDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
  const [memberData, setMemberData] = useState(null);
  const [showFreeUseModal, setShowFreeUseModal] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const [totalAmount, setTotalAmount] = useState(null);
  const [deduction, setDeduction] = useState(null);
  const [purpose, setPurpose] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReaderRef = useRef(new BrowserMultiFormatReader());

  const isInvalidBalance =
    memberData.DiscountPoint - deduction < 0 ||
    memberData.Point - totalAmount + deduction < 0;

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleDefaultDeduction = () => {
    const half = Math.floor(totalAmount / 2);
    setDeduction(Math.min(half, memberData.DiscountPoint));
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINT}/${MembershipField}?filters[Email][$eq]=${memberData.Email}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        params: {
          filters: {
            Email: {
              $eq: memberData.Email
            }
          }
        }
      });

      const match = res.data?.data;
      if (!match || match.length !== 1) throw new Error('未找到唯一会员');

      const memberID = match[0].documentId;
      const currentPoints = match[0].Point;
      const currentDiscount = match[0].DiscountPoint;

      const newPoints = currentPoints - totalAmount + deduction;
      const newDiscount = currentDiscount - deduction;

      // eslint-disable-next-line no-unused-vars
      const { id, attributes: cleanData } = match[0];

      console.log("Payload: ",
        {
          ...cleanData,
          Point: newPoints,
          DiscountPoint: newDiscount
        }
      );

      await axios.put(`${API_ENDPOINT}/${MembershipField}/${memberID.trim()}`, {
        data: {
          ...cleanData,
          Point: newPoints,
          DiscountPoint: newDiscount
        }
      }, {
        headers: { Authorization: `Bearer ${API_KEY}` }
      });

      await axios.post(`${BACKEND_API}/record-md-deduction`, {
        amount: totalAmount,
        account: Cookies.get('username'),
        member: memberData.Email,
        notes: `${purpose}（Discounted: ${deduction}）`
      });

      setSuccessMsg(true);
    } catch (err) {
      console.error(err);
      alert('提交失败，请检查网络或数据格式');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = () => {
    setShowFreeUseModal(false);
    setShowConfirmModal(false);
    setSuccessMsg(false);
    setTotalAmount(0);
    setDeduction(0);
    setPurpose('');
  };

  const handleConfirmDetail = () => {
    if (!totalAmount || !deduction || !purpose.trim()) {
      alert('请完整填写所有字段');
      return;
    }
    setShowConfirmModal(true);
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

            <div className="mt-6 flex flex-col gap-4">
              <button
                onClick={() => setShowFreeUseModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
              >
                <i className="bi bi-currency-dollar mr-2"></i> 自由消费
              </button>

              <button
                disabled
                className="bg-gray-400 text-white font-semibold py-2 px-4 rounded flex items-center justify-center opacity-60 cursor-not-allowed"
              >
                <i className="bi bi-box-seam mr-2"></i> 商品兑换
              </button>

              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded flex items-center justify-center"
              >
                <i className="bi bi-check-circle mr-2"></i> 确认
              </button>
            </div>
          </div>
        )}

        {/* 自由消费弹窗 */}
        {showFreeUseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative animate-zoom-in">
              <button
                onClick={() => setShowFreeUseModal(false)}
                className="absolute top-4 right-4 text-gray-500 text-xl"
              >×</button>
              <h2 className="text-xl font-bold mb-4">自由消费表单</h2>

              <div className="mb-3">
                <label className="block text-sm font-medium">Membership Number</label>
                <input type="text" value={memberData.MembershipNumber} disabled className="w-full bg-gray-100 border rounded px-3 py-2 mt-1" />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium">Member Email</label>
                <input type="text" value={memberData.Email} disabled className="w-full bg-gray-100 border rounded px-3 py-2 mt-1" />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium">Total Amounts</label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  max={memberData.Point + memberData.DiscountPoint}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium">Deduction</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    value={deduction}
                    onChange={(e) => setDeduction(Number(e.target.value))}
                    max={memberData.DiscountPoint}
                    className="w-full border rounded px-3 py-2 mt-1"
                  />
                  <button className="bg-black text-white min-w-14 min-h-10 text-sm px-3 py-1 rounded mt-1" onClick={handleDefaultDeduction}>默认</button>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium">Purpose / Notes</label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  maxLength={120}
                  rows={2}
                  className="w-full border rounded px-3 py-2 mt-1"
                />
              </div>

              <div className="text-sm text-gray-700 mb-3">
                点数: {memberData.Point} <i className="bi bi-arrow-right mx-2"></i> {memberData.Point - totalAmount + deduction}
              </div>
              <div className="text-sm text-gray-700 mb-3">
                折扣点: {memberData.DiscountPoint} <i className="bi bi-arrow-right mx-2"></i> {memberData.DiscountPoint - deduction}
              </div>

              <button
                onClick={handleConfirmDetail}
                disabled={isInvalidBalance}
                className={`w-full font-bold py-2 px-4 rounded mt-4 flex items-center justify-center 
    ${isInvalidBalance
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'}
  `}
              >
                <i className="bi bi-send-check mr-2"></i> Confirm
              </button>
            </div>
          </div>
        )}

        {/* 二次确认弹窗 */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative animate-fade-in">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="absolute top-4 right-4 text-gray-500 text-xl"
              >×</button>
              <h2 className="text-lg font-bold mb-4 text-center">
                请交由会员进行确认
              </h2>
              <div className="text-sm text-gray-700 space-y-1 mb-4">
                <p><strong>Membership:</strong> {memberData.MembershipNumber}</p>
                <p><strong>Email:</strong> {memberData.Email}</p>
                <p><strong>会员点:</strong> {memberData.Point} → {memberData.Point - totalAmount + deduction}</p>
                <p><strong>折扣点:</strong> {memberData.DiscountPoint} → {memberData.DiscountPoint - deduction}</p>
              </div>
              <button
                onClick={handleFinalSubmit}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
              >
                <i className="bi bi-check2-circle mr-2"></i> I confirm this purchase
              </button>
            </div>
          </div>
        )}

        {/* 黑幕 Loading 状态 */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="text-center">
              <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-white rounded-full" role="status"></div>
              <p className="text-white mt-4">处理中，请稍候...</p>
            </div>
          </div>
        )}

        {/* 成功提示 */}
        {successMsg && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={resetAll}>
            <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex flex-col items-center animate-zoom-in">
              <i className="bi bi-check-circle-fill text-green-500 text-4xl mb-2"></i>
              <p className="text-green-700 font-semibold">兑换成功！信息已更新。</p>
            </div>
          </div>
        )}

      </div>
  );
};

export default MembershipManagement;
