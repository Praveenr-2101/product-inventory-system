import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { format } from 'date-fns';
import Layout from '../pages/Layout';
import useAuth from '../hooks/useAuth';
import { API_ROUTES } from '../utils/apiRoutes';


const DEFAULT_IMAGE = API_ROUTES.DEFAULT_IMAGE;

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const ProductList = () => {

  const { authAxios } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState(`${API_BASE}${API_ROUTES.PRODUCT_LIST}`);

  useEffect(() => {
    const fetchProducts = async () => {

      setLoading(true);
      setError(null);
      try {
        const res = await authAxios.get(currentPageUrl);
        setProducts(res.data.results);
        setNextPage(res.data.next);
        setPreviousPage(res.data.previous);
      } catch {
         console.error("Fetch error:", err);
        setError('Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPageUrl]);

  const handlePagination = (direction) => {
    if (direction === 'next' && nextPage) setCurrentPageUrl(nextPage);
    if (direction === 'prev' && previousPage) setCurrentPageUrl(previousPage);
  };

  const renderProductCard = (product) => {
    const imageUrl = product.ProductImage ? `${API_BASE}${product.ProductImage}` : DEFAULT_IMAGE;

    return (
      <div key={product.id} className="bg-white rounded-xl shadow p-4">

        <div className="w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">
          <img
            src={imageUrl}
            alt={product.ProductName}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = DEFAULT_IMAGE;
            }}
            className={
              product.ProductImage
                ? 'w-full h-full object-contain p-4'
                : 'w-16 h-16 rounded-full'
            }
          />
        </div>

        <div className="flex justify-between items-center my-2">
          <h2 className="text-lg font-semibold">{product.ProductName}</h2>
          {product.IsFavourite ? (
            <FaHeart className="text-red-500" />
          ) : (
            <FaRegHeart className="text-gray-400" />
          )}
        </div>

        <p className="text-sm text-gray-600 mb-1">
          <strong>Code:</strong> {product.ProductCode || 'N/A'}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Stock:</strong> {parseFloat(product.TotalStock).toFixed(2)}
        </p>

        {product.variants?.length > 0 && (
          <div className="bg-gray-50 p-2 rounded text-sm">
            {product.variants.map((variant) => (
              <div key={variant.id}>
                <p className="font-medium">{variant.name}</p>
                <ul className="list-inside ml-3">
                  {variant.options?.length > 0 ? (
                    variant.options.map((opt) => (
                      <li key={opt.id}>
                        {opt.value} — Stock: {parseFloat(opt.stock).toFixed(2)}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-400">No options</li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-3">
          Created: {format(new Date(product.CreatedDate), 'PPP p')}
        </p>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-8">
          📦 Products List
        </h1>

        {loading && <div className="text-center p-4">Loading...</div>}
        {error && <div className="text-center p-4 text-red-500">{error}</div>}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(renderProductCard)}
            </div>

            <div className="flex justify-center mt-6 gap-4">
              <button
                onClick={() => handlePagination('prev')}
                disabled={!previousPage}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePagination('next')}
                disabled={!nextPage}
                className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default ProductList;
