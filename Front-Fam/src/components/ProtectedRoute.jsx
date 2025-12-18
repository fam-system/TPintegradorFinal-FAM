import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, rol, allowedRol }) => {
  if (rol !== allowedRol) {
    // Si el rol no es el permitido, redirige a la página de login
    return <Navigate to="/" />;
  }
  return children; // Si el rol es correcto, renderiza el contenido
};

export default ProtectedRoute;