import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FileViewer from './pages/FileViewer';
import { useAuth } from './context/AuthContext';
import './styles.css';

function App() {
  const { user } = useAuth();
  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 18 }}>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/files/:name" element={user ? <FileViewer /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
}
export default App;
