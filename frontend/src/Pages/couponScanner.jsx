import { useState, useEffect, useRef, useMemo } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

const CouponScanner = () => {
  const [scanResult, setScanResult] = useState('');
  const [error, setError] = useState(null);
  const [successResult, setSuccessResult] = useState(null);
  const [couponStatus, setCouponStatus] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(1);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReaderRef = useRef(null);

  const { t } = useTranslation();

  const username = Cookies.get('username');
  const BACKEND_API = import.meta.env.VITE_BACKEND_API;

  useEffect(() => {
    const initScanner = async () => {
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      const codeReader = new BrowserMultiFormatReader(hints);

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter((device) => device.kind === 'videoinput');

        if (videoInputDevices.length === 0) {
          setError(t("scan.camerr"));
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
            console.error(err);
            setError(t("scan.videoerr"));
          });
        };

        if (!scanResult || scanResult === '') {
          codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result) => {
            if (result) {
              handleScan(result.getText());
              setError(null);
              try { codeReaderRef.current?.reset(); } catch {}
            }
          });
        }
      } catch (err) {
        console.error('Fail to initialise cam:', err);
        setError(t("scan.camerr"));
      }
    };

    initScanner();

    return () => {
      try { codeReaderRef.current?.reset(); } catch {}
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDeviceIndex]);

  useEffect(() => {
    if (couponStatus?.status === 'valid') {
      setSuccessResult(couponStatus);
    }
  }, [couponStatus]);

  // manually filter XSS to set dangerous to safeeeeeeeeeeeeeeeeeeeeeeeee
  const sanitizeHTML = (html) => {
    const raw = html || '';
    const clean = DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'a', 'span'],
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    });
    return { __html: clean };
  };
  // Memo for performance
  const safeCouponDesc = useMemo(
    () => sanitizeHTML(couponStatus?.description),
    [couponStatus?.description]
  );

  const handleScan = async (data) => {
    if (!data) return;
    if (scanResult !== '') return;
    setScanResult(data);

    try {
      const response = await axios.post(`${BACKEND_API}/validate-coupon`, { hash: data, provider: username });
      setCouponStatus(response.data);
    } catch (error) {
      console.error('Fail to verify:', `trying to connect ${BACKEND_API}/validate-coupon`, error);
      setCouponStatus({ status: 'invalid', message: t("scan.loseconn") });
    }
  };

  const handleConfirmUse = async () => {
    if (!couponStatus || couponStatus.status !== 'valid') return;

    try {
      const response = await axios.post(`${BACKEND_API}/use-coupon`, { hash: scanResult, username });
      setCouponStatus(response.data);
      setSuccessResult(null);
    } catch (error) {
      console.error('Fail to use:', `tried to connect ${BACKEND_API}/use-coupon`, error);
      alert(t("scan.userr"));
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

    return <p className={`${couponStatus.status === 'valid' || couponStatus.status === 'done' 
                            ? "text-green-600" : "text-red-500"} mt-2`}>
            {couponStatus.message}
          </p>;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-100">

      <h1 className="text-2xl font-bold mb-4">{t("scan.scanqr")}</h1>
      <div className="w-full max-w-md bg-white p-4 shadow rounded">
        <div className="relative w-full max-w-md mx-auto">
          <video
            ref={videoRef}
            className="w-full aspect-square object-cover bg-black"
            muted
          />
          <svg
            className="absolute inset-0 w-full h-full text-amber-200/50 pointer-events-none"
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
        <i className="bi bi-arrow-clockwise"></i> {t("scan.switch_cam")}
      </button>

      {/* Success coupon display Modal */}
      {successResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full relative animate-fade-in">
            <button
              onClick={() => {setSuccessResult(null); setScanResult('');}}
              className="absolute top-4 right-4 text-gray-500 text-xl"
            ><i className="bi bi-x-lg"></i></button>
            <p className="text-green-500 mt-2 text-lg">{couponStatus.title}</p>
            <p className="text-gray-700 bg-amber-100/50 mt-1 text-sm max-h-[50vh] overflow-y-auto" 
                dangerouslySetInnerHTML={ safeCouponDesc }>
            </p>
            <p className="text-gray-500 mt-2 text-xs max-h-[150px] overflow-y-auto">
              {t("scan.usesleft")} {couponStatus.uses_left}
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => {setSuccessResult(null); setScanResult('');}}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                <i className="bi bi-arrow-left-short"></i> {t("scan.rescan")}
              </button>

              <button
                onClick={handleConfirmUse}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                {t("scan.confirm")} <i className="bi bi-check2-circle"></i> 
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponScanner;
