import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Empleado from './pages/Empleado';
import Encargado from './pages/Encargado';
import OficinaTecnica from './pages/OficinaTecnica';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        {/* La ruta raíz siempre muestra Login */}
        <Route
          path="/"
          element={<Login onLogin={setUser} />}
        />
        {/* Rutas protegidas para cada rol */}
        <Route
          path="/empleado"
          element={
            <ProtectedRoute rol={user?.idRol} allowedRol={4}>
              <Empleado setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/encargado"
          element={
            <ProtectedRoute rol={user?.idRol} allowedRol={2}>
              <Encargado setUser={setUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/oficinaTecnica"
          element={
            <ProtectedRoute rol={user?.idRol} allowedRol={3}>
              <OficinaTecnica setUser={setUser} />
            </ProtectedRoute>
          }
        />
        {/* Redirigir cualquier ruta desconocida a Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;