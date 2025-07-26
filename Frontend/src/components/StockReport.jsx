import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Layout from '../pages/Layout';
import useAuth from '../hooks/useAuth';
import { API_ROUTES } from "../utils/apiRoutes";

const StockReport = () => {
  const { authAxios } = useAuth();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [reports, setReports] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPageUrl, setCurrentPageUrl] = useState(`${BASE_URL}${API_ROUTES.PRODUCT_STOCK_REPORT}`);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = (url = currentPageUrl) => {
    setLoading(true);
    authAxios
      .get(url, {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      })
      .then((res) => {
        setReports(res.data.results);
        setNextPage(res.data.next);
        setPreviousPage(res.data.previous);
      })
      .catch((err) => console.error('Report fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [currentPageUrl]);

  const applyFilters = (e) => {
    e.preventDefault();
    const url = `${BASE_URL}${API_ROUTES.PRODUCT_STOCK_REPORT}`;
    setCurrentPageUrl(url);
    fetchReports(url);
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-8 flex justify-center items-center gap-2">
          <span role="img" aria-label="box">📦</span> Stock Report
        </h1>

        <form
          onSubmit={applyFilters}
          className="bg-white p-6 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 gap-6 mb-10"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md transition"
            >
              Apply Filters
            </button>
          </div>
        </form>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : reports.length === 0 ? (
          <p className="text-center text-gray-500 bg-white p-8 rounded-md shadow">No records found.</p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700 font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Product</th>
                  <th className="px-6 py-3 text-left">Variant</th>
                  <th className="px-6 py-3 text-left">Qty</th>
                  <th className="px-6 py-3 text-left">Type</th>
                  <th className="px-6 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reports.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-gray-800">{t.id}</td>
                    <td className="px-6 py-3 text-gray-800">{t.product_name}</td>
                    <td className="px-6 py-3 text-gray-800">
                      {t.variant_name ? `${t.variant_name}: ${t.option_value}` : '—'}
                    </td>
                    <td className="px-6 py-3 text-gray-800 font-semibold">
                      {parseFloat(t.quantity).toFixed(2)}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          t.transaction_type === 'IN'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {format(new Date(t.CreatedDate), 'yyyy-MM-dd HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-center mt-6 gap-4">
          <button
            onClick={() => previousPage && setCurrentPageUrl(previousPage)}
            disabled={!previousPage}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => nextPage && setCurrentPageUrl(nextPage)}
            disabled={!nextPage}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default StockReport;
