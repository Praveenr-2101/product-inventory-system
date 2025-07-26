import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-600">
          <Link to="/">QuickStock</Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
            Home
          </Link>
          {!user ? (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">
                Login
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-blue-600 font-medium">
                Register
              </Link>
            </>
          ) : (
            <>
              <span className="text-gray-600 hidden sm:inline">Welcome, {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      <main className="flex flex-col items-center justify-start min-h-[calc(100vh-4rem)] px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2">
            Welcome to QuickStock
          </h1>
          <p className="text-gray-700 text-lg">
            {user
              ? 'Explore your dashboard and manage your products.'
              : 'This is a secure product inventory system. Please log in or register to get started.'}
          </p>
        </div>

        {user && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full">
            <Link
              to="/products"
              className="p-6 bg-blue-100 rounded-lg shadow hover:bg-blue-200 transition"
            >
              <h2 className="text-xl font-semibold text-blue-700">📦 Product List</h2>
              <p className="text-sm text-gray-600">View and manage all products</p>
            </Link>

            <Link
              to="/add-product"
              className="p-6 bg-green-100 rounded-lg shadow hover:bg-green-200 transition"
            >
              <h2 className="text-xl font-semibold text-green-700">➕ Add Product</h2>
              <p className="text-sm text-gray-600">Create a new product</p>
            </Link>

            <Link
              to="/stock"
              className="p-6 bg-yellow-100 rounded-lg shadow hover:bg-yellow-200 transition"
            >
              <h2 className="text-xl font-semibold text-yellow-700">📊 Stock Management</h2>
              <p className="text-sm text-gray-600">Adjust and track stock levels</p>
            </Link>

            <Link
              to="/reports"
              className="p-6 bg-purple-100 rounded-lg shadow hover:bg-purple-200 transition"
            >
              <h2 className="text-xl font-semibold text-purple-700">📈 Reports</h2>
              <p className="text-sm text-gray-600">View inventory performance</p>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

export default HomePage;
