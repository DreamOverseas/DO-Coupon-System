import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import QRCode from 'qrcode';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const CouponPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('Title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const itemsPerPage = 12;
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(() => {
    // Fetch coupons from Strapi backend
    const fetchCoupons = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINT}/coupons`, {
          headers: {
            Authorization: `Bearer ${API_KEY}`
          },
          params: {
            'populate': 'AssignedFrom'
          }
        });
        setCoupons(response.data.data);
      } catch (error) {
        console.error('Error fetching coupons:', error);
      }
    };

    fetchCoupons();
  }, [API_ENDPOINT, API_KEY]);

  // Filter and sort coupons based on search, active toggle, and sort options
  const filteredAndSortedCoupons = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();

    // Filter by search term
    const filtered = coupons.filter((coupon) => {
      const matchesSearch =
        coupon.Title.toLowerCase().includes(lowerSearchTerm) ||
        coupon.AssignedTo.toLowerCase().includes(lowerSearchTerm) ||
        coupon.AssignedFrom.data.Name.toLowerCase().includes(lowerSearchTerm);

      const matchesActive = showActiveOnly ? coupon.Active : true;

      return matchesSearch && matchesActive;
    });

    // Sort by selected field and order
    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [coupons, searchTerm, showActiveOnly, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedCoupons.length / itemsPerPage);
  const displayedCoupons = useMemo(() =>
    filteredAndSortedCoupons.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ),
    [filteredAndSortedCoupons, currentPage, itemsPerPage]
  );

  // Handle QR Code download
  const handleDownloadQR = async (hash, title) => {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(hash);
      const link = document.createElement('a');
      link.href = qrCodeDataURL;
      link.download = `${title}.png`;
      link.click();
    } catch (error) {
      console.error('Error generating QR Code:', error);
    }
  };

  const handleLogout = () => {
    // Del All Cookies
    Cookies.remove('username');
    Cookies.remove('role');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow p-4 flex items-center justify-between md:justify-start md:gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo512.png" alt="Logo" className="w-12 h-12" />
          <h1 className="text-xl font-bold">DO Coupon System Admin</h1>
        </div>
        <div className="flex-1 hidden md:flex justify-between items-center">
          <div className="flex gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search"
              className="border rounded px-4 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Active Toggle */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showActiveOnly}
                onChange={() => setShowActiveOnly((prev) => !prev)}
              />
              <span>Show Active Only</span>
            </label>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <select
                className="border rounded px-2 py-2"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
              >
                <option value="Title">Title</option>
                <option value="Expiry">Expiry</option>
                <option value="UsesLeft">Uses Left</option>
              </select>
              <button
                className="border rounded px-2 py-2"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <a
              href="https://api.do360.com/admin/content-manager/collection-types/api::coupon.coupon/create"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-white px-4 py-2 rounded"
            >
              New/新增
            </a>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleLogout}
            >
              Logout/登出
            </button>
          </div>
        </div>
        <button
          className="md:hidden text-xl"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          ☰
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="bg-white shadow p-4 flex flex-col gap-4 md:hidden">
          <input
            type="text"
            placeholder="Search"
            className="border rounded px-4 py-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={() => setShowActiveOnly((prev) => !prev)}
            />
            <span>Show Active Only</span>
          </label>
          <div className="flex items-center gap-2">
            <select
              className="border rounded px-2 py-2"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="Title">Title</option>
              <option value="Expiry">Expiry</option>
              <option value="UsesLeft">Uses Left</option>
            </select>
            <button
              className="border rounded px-2 py-2"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
          <a
            href="https://api.do360.com/admin/content-manager/collection-types/api::coupon.coupon/create"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white px-4 py-2 rounded text-center"
          >
            New/新增
          </a>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded text-center"
            onClick={handleLogout}
          >
            Logout/登出
          </button>
        </div>
      )}

      {/* Coupons */}
      <main className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayedCoupons.map((coupon) => (
          <div
            key={coupon.Hash}
            className="bg-white p-4 shadow rounded flex flex-col justify-between"
          >
            <div>
              <h3 className="text-lg font-bold">{coupon.Title}</h3>
              <p className="text-sm text-gray-600 max-h-16 overflow-auto">{coupon.Description}</p>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span>{coupon.AssignedFrom.Name}</span>
              <span className="text-xl">→</span>
              <span>{coupon.AssignedTo}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between items-center">
              <span>{coupon.UsesLeft} uses left</span>
              <span>|</span>
              <span>{new Date(coupon.Expiry).toLocaleDateString()}</span>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span
                className={`px-2 py-1 rounded text-white ${coupon.Active ? 'bg-green-500' : 'bg-red-500'
                  }`}
              >
                {coupon.Active ? 'Active' : 'Inactive'}
              </span>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => handleDownloadQR(coupon.Hash, coupon.Title)}
                title="Download QR"
              >
                <i className="bi bi-cloud-download text-2xl"></i>
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Pagination */}
      <footer className="p-4 flex justify-center items-center gap-4">
        <button
          className="border px-4 py-2 rounded"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded border ${currentPage === index + 1 ? 'bg-blue-500 text-white' : ''
              }`}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}
        <button
          className="border px-4 py-2 rounded"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </footer>
    </div>
  );
};

export default CouponPage;
