import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import Compare from './pages/Compare';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock/:ticker" element={<StockDetail />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </div>
    </div>
  );
}
