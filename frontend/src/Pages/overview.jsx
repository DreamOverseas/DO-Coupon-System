import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useTranslation } from 'react-i18next';

const Overview = () => {
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
  const API_KEY = import.meta.env.VITE_API_KEY;

  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { t } = useTranslation();

  const ITEMS_PER_PAGE = 9;
  const username = Cookies.get('username');

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get(
          `${API_ENDPOINT}/coupons`,
          {
            headers: {
              Authorization: `Bearer ${API_KEY}`,
            },
            params: {
              'filters[AssignedFrom][Name][$eq]': username,
              'populate': 'AssignedFrom'
            }
          }
        );
        const fetchedCoupons = response.data.data.map((item) => ({
          id: item.id,
          ...item,
        }));
        setCoupons(fetchedCoupons);
        setFilteredCoupons(fetchedCoupons);
        setTotalPages(Math.ceil(fetchedCoupons.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    fetchCoupons();
  }, [API_ENDPOINT, API_KEY, username]);

  useEffect(() => {
    let filtered = coupons;

    if (searchTerm) {
      filtered = filtered.filter(
        (coupon) =>
          coupon.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          coupon.AssignedTo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (showActiveOnly) {
      filtered = filtered.filter((coupon) => coupon.Active === true);
    }

    setFilteredCoupons(filtered);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [searchTerm, showActiveOnly, coupons]);

  const currentCoupons = filteredCoupons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="p-4">
      {/* Search n filter */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder={t("overview.search")}
          className="border px-4 py-2 rounded w-full max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <label className="ml-4 flex items-center">
          <input
            type="checkbox"
            className="mr-2"
            checked={showActiveOnly}
            onChange={() => setShowActiveOnly(!showActiveOnly)}
          />
          {t("overview.onlyactive")}
        </label>
      </div>

      {/* displays all coupons */}
      {filteredCoupons.length === 0 ? (
        <div className="text-center mt-10">
          <p className="text-xl font-bold text-gray-500">{t("overview.nothing")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="border rounded shadow p-4 flex flex-col"
            >
              <h2 className="text-lg font-bold">{coupon.Title}</h2>
              <p className="text-sm text-gray-500 max-h-[75px] overflow-y-auto">{coupon.Description}</p>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">{t("overview.assignto")}: {coupon.AssignedTo}</p>
                <span
                  className={`px-2 py-1 rounded ${
                    coupon.Active ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}
                >
                  {coupon.Active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-700"><i className="bi bi-ticket-detailed mr-2"> {coupon.UsesLeft}</i> <i className="bi bi-hr"> {coupon.Scanned}</i></p>
                <p className="text-sm text-gray-700">{t("overview.exp")}: {coupon.Expiry}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagenation */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center items-center space-x-2">
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded ${
                currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Overview;
