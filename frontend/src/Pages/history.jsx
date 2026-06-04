import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

const History = () => {
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const username = Cookies.get('username');
  const { t } = useTranslation();

  const formatRecordDate = (time) => {
    if (!time) return '-';
    const date = new Date(time);
    if (Number.isNaN(date.getTime())) return '-';

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDateKey = (time) => {
    if (!time) return t('history.unknownDate');
    const date = new Date(time);
    if (Number.isNaN(date.getTime())) return t('history.unknownDate');

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const parseAmount = (amount) => {
    const parsed = Number(amount);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const totalAmount = filteredRecords.reduce(
    (sum, record) => sum + parseAmount(record.Amount),
    0
  );

  const groupedByDate = filteredRecords.reduce((groups, record) => {
    const dateKey = getDateKey(record.Time);
    if (!groups[dateKey]) {
      groups[dateKey] = {
        records: [],
        total: 0,
      };
    }

    groups[dateKey].records.push(record);
    groups[dateKey].total += parseAmount(record.Amount);
    return groups;
  }, {});

  const groupedEntries = Object.entries(groupedByDate);

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
        (
          record.Consumer &&
          record.Consumer.trim() !== '' &&
          record.Consumer.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        (
          record.AdditionalInfo &&
          record.AdditionalInfo.trim() !== '' &&
          record.AdditionalInfo.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );
    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  return (
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">{t("history.title")}</h1>

      {/* Search Inputtin' field */}
      <input
        type="text"
        placeholder={t("history.search")}
        className="border px-4 py-2 rounded mb-4 w-full max-w-md"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="mb-4 p-3 bg-white rounded shadow-sm border">
        <p className="text-sm text-gray-500">{t('history.totalAmountLabel')}</p>
        <p className="text-2xl font-bold text-gray-800">{totalAmount}</p>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded shadow-inner">
        {filteredRecords.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-xl font-bold text-gray-500">{t("history.nope")}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedEntries.map(([date, group]) => (
              <div key={date} className="bg-white rounded border shadow-sm p-4">
                <div className="flex items-center justify-between border-b pb-2 mb-3">
                  <p className="font-bold text-gray-800">{date}</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {t('history.dailyTotalLabel')}: {group.total}
                  </p>
                </div>

                <ul className="space-y-3">
                  {group.records.map((record, index) => (
                    <li
                      key={`${date}-${index}`}
                      className="rounded border p-3 bg-gray-50"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {record.Consumer || '-'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRecordDate(record.Time)}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-emerald-700">
                          {t('history.amountLabel')}: {parseAmount(record.Amount)}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm text-gray-700">
                        <p>
                          <span className="font-medium">{t('history.providerLabel')}:</span>{' '}
                          {record.Provider || '-'}
                        </p>
                        <p>
                          <span className="font-medium">{t('history.platformLabel')}:</span>{' '}
                          {record.Platform || '-'}
                        </p>
                        <p className="sm:col-span-2 break-words">
                          <span className="font-medium">{t('history.detailLabel')}:</span>{' '}
                          {record.AdditionalInfo || '-'}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
