import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegistrationPage from './pages/RegistrationPage';
import HomePage from './pages/HomePage';
import ProductFrom from './components/ProductForm';
import ProductList from './components/ProductList';
import StockManagement from './components/StockManagement';
import StockReport from './components/StockReport';


function App() {
  return (
     <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/products" element={<ProductList/>} />
        <Route path="/add-product" element={<ProductFrom />} />
        <Route path="/stock" element={<StockManagement />} />
        <Route path="/reports" element={<StockReport />} />
      </Routes>
    </div>
  );
}

export default App;
