import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Contracts from './components/Contracts';
import Wishlist from './components/Wishlist';
import WallOfShame from './components/WallOfShame';
import FreeTasks from './components/FreeTasks';
import RedemptionStore from './components/RedemptionStore';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute allowedRoles={['goddess', 'sub', 'developer']} />}>
            <Route path="/contracts" element={<Contracts />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/wall-of-shame" element={<WallOfShame />} />
            <Route path="/free-tasks" element={<FreeTasks />} />
            <Route path="/store" element={<RedemptionStore />} />
          </Route>
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
