
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Layout({ children }) {
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
          <Link to="/">MyApp</Link>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Home</Link>
          {user && (
            <>
              <Link to="/products" className="text-gray-700 hover:text-blue-600 font-medium">Products</Link>
              <Link to="/add-product" className="text-gray-700 hover:text-blue-600 font-medium">Add</Link>
              <Link to="/stock" className="text-gray-700 hover:text-blue-600 font-medium">Stock</Link>
              <Link to="/reports" className="text-gray-700 hover:text-blue-600 font-medium">Reports</Link>
            </>
          )}
          {!user ? (
            <>
              <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium">Login</Link>
              <Link to="/register" className="text-gray-700 hover:text-blue-600 font-medium">Register</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Logout</button>
          )}
        </div>
      </nav>

      <main className="p-6">{children}</main>
    </div>
  );
}

export default Layout;
