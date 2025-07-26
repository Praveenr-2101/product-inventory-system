import React, { useState, useEffect } from 'react';
import Layout from '../pages/Layout';
import useAuth from '../hooks/useAuth';
import { API_ROUTES } from "../utils/apiRoutes";

const StockManagement = () => {

  const { authAxios } = useAuth();

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [quantity, setQuantity] = useState('');
  const [transactionType, setTransactionType] = useState('add');


  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    authAxios
      .get(`${BASE_URL}${API_ROUTES.PRODUCT_LIST}?page_size=all`)
      .then((res) => setProducts(res.data.results))
      .catch((err) => console.error('Error fetching products:', err));
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const resetForm = () => {
    setSelectedProduct('');
    setSelectedVariant('');
    setSelectedOption('');
    setQuantity('');
  };

  const currentProduct = products.find((p) => p.id === selectedProduct);
  const currentVariant = currentProduct?.variants.find((v) => v.id === selectedVariant);
  const currentOption = currentVariant?.options.find((o) => o.id === selectedOption);
  const currentStock = currentOption ? parseInt(currentOption.stock, 10) || 0 : 0;

 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!selectedProduct || !selectedVariant || !selectedOption || !quantity || quantity <= 0) {
      setError('All fields are required and quantity must be positive.');
      setLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload = {
      sub_variant_id: selectedOption,
      quantity: parseInt(quantity, 10),
    };

    const endpoint =
      transactionType === 'add'
        ? `${BASE_URL}${API_ROUTES.PRODUCT_ADD_STOCK}`
        : `${BASE_URL}${API_ROUTES.PRODUCT_REMOVE_STOCK}`;

    try {
      await authAxios.post(endpoint, payload);
      setSuccess(`Stock ${transactionType === 'add' ? 'added' : 'removed'} successfully.`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => resetForm(), 2500);
    } catch (err) {
      const detail = err.response?.data?.detail || JSON.stringify(err.response?.data || {});
      setError(`Failed to ${transactionType} stock. ${detail}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-8">
          📊 Stock Management
        </h1>

        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 border border-green-300 rounded-md">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 border border-red-300 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setSelectedVariant('');
                setSelectedOption('');
              }}
              className="w-full border rounded p-2"
              required
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.ProductName} ({p.ProductCode})
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && currentProduct?.variants?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Variant</label>
              <select
                value={selectedVariant}
                onChange={(e) => {
                  setSelectedVariant(e.target.value);
                  setSelectedOption('');
                }}
                className="w-full border rounded p-2"
                required
              >
                <option value="">-- Choose Variant --</option>
                {currentProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedVariant && currentVariant?.options?.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option</label>
              <select
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                className="w-full border rounded p-2"
                required
              >
                <option value="">-- Choose Option --</option>
                {currentVariant.options.map((opt) => {
                  let display = opt.value;
                  try {
                    const parsed = JSON.parse(opt.value.replace(/'/g, '"'));
                    display = parsed.value || opt.value;
                  } catch {}
                  return (
                    <option key={opt.id} value={opt.id}>
                      {display} | SKU: {opt.sku} | Stock: {opt.stock}
                    </option>
                  );
                })}
              </select>
              {selectedOption && (
                <p className="text-sm text-gray-500 mt-1">
                  Current Stock: <strong>{currentStock}</strong>
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === '' ? '' : parseInt(e.target.value, 10) || '')
              }
              className="w-full border rounded p-2"
              placeholder="e.g., 5"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
            <div className="flex gap-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="transactionType"
                  value="add"
                  checked={transactionType === 'add'}
                  onChange={() => setTransactionType('add')}
                  className="mr-2"
                />
                Add
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="transactionType"
                  value="remove"
                  checked={transactionType === 'remove'}
                  onChange={() => setTransactionType('remove')}
                  className="mr-2"
                />
                Remove
              </label>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded font-bold text-white transition ${
                transactionType === 'add'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : transactionType === 'add' ? 'Add Stock' : 'Remove Stock'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="ml-4 text-sm text-blue-600 hover:underline"
            >
              Clear Form
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default StockManagement;
