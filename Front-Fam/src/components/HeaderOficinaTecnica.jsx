import React, { useState } from "react";
import "./Header.css";
import { useNavigate } from 'react-router-dom';
import EmpleadoNuevo from './OficinaTecnicaComp/CargarEmpleado';

const Header = ({ setUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')); // Obtener usuario del localStorage
console.log("usuario:",user)
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const roleLabel = (id) => {
    switch (+id) {
      case 1: return "Administrador";
      case 2: return "Encargado";
      case 3: return "Oficina Técnica";
      case 4: return "Operario";
      default: return "Usuario no identificado";
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    
    <header className="header">
      <div className="logo-container">
        <img src="/logoFAM.png" alt="Logo Empresa" className="logo" />
      </div>

      <div className="user-section">
        <div className="dropdown-wrapper">
          <button className="login-btn" onClick={toggleDropdown}>
            Logout ⬇
          </button>
          <div className={`dropdown ${dropdownOpen ? "open" : ""}`}>
            <button onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>
        {/* Mostrar nombre y rol del usuario */}
        {user && (
          <div className="header-user-sub">
            <div className="header-user-name">{user.nombreUsuario}</div>
            
            <div className="header-user-role">{roleLabel(user.idRol)}</div>
          </div>
        )}
      </div>
      <div><EmpleadoNuevo /></div>
    </header>
  );
};

export default Header;