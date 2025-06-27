import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const History = () => {
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const username = Cookies.get('username');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          `${API_ENDPOINT}/coupon-sys-accounts?filters[Name][$eq]=${username}&populate=ConsumptionRecord`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );
        const account = response.data.data[0];
        if (account && account.ConsumptionRecord) {
          const sortedRecords = account.ConsumptionRecord.sort(
            (a, b) => new Date(b.Time) - new Date(a.Time)
          );
          setRecords(sortedRecords);
          setFilteredRecords(sortedRecords);
        } else {
          setRecords([]);
          setFilteredRecords([]);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, [API_ENDPOINT, API_KEY, username]);

  useEffect(() => {
    const filtered = records.filter(
      (record) =>
        record.Consumer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.AdditionalInfo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  return (
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">卡券使用历史 / Coupon History</h1>

      {/* Search Inputtin' field */}
      <input
        type="text"
        placeholder="Search/搜索记录..."
        className="border px-4 py-2 rounded mb-4 w-full max-w-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* History */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded shadow-inner">
        {filteredRecords.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-xl font-bold">暂无使用记录</p>
            <p className="text-gray-500">No consumption records available</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredRecords.map((record, index) => (
              <li
                key={index}
                className="border-b pb-2 last:border-b-0 flex flex-col"
              >
                <div className="flex justify-between items-center">
                  <p className="font-bold text-gray-700">{record.Consumer}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(record.Time).toLocaleString('zh-CN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {record.AdditionalInfo}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default History;
