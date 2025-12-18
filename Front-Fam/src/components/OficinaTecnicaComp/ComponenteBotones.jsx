import React, { useState } from "react";
import AltaEmpleado from "./AltaEmpleado";
import BajaEmpleado from "./BajaEmpleado";
import CargarEmpleado from "./CargarEmpleado";
import CrearPuesto from "./CrearPuesto";
import BajaPuesto from "./BajaPuesto";
import AltaPuesto from "./AltaPuesto";
import './ComponenteBotones.css';

export default function ComponenteBotones() {
  const [empleadosOpen, setEmpleadosOpen] = useState(true);
  const [puestosOpen, setPuestosOpen] = useState(true);

  return (
    <div className="menu-acciones-container-50">
      <div className="menu-acciones-box">
        {/* Sección Empleados */}
        <div className="accordion-section">
          <div 
            className="accordion-header" 
            onClick={() => setEmpleadosOpen(!empleadosOpen)}
          >
            <h3>Empleados</h3>
            <span>{empleadosOpen ? "▲" : "▼"}</span>
          </div>
          {empleadosOpen && (
            <div className="accordion-content">
              <div className="boton-item"><CargarEmpleado /></div>
              <div className="boton-item"><BajaEmpleado /></div>
              <div className="boton-item"><AltaEmpleado /></div>
            </div>
          )}
        </div>

        {/* Sección Puestos */}
        <div className="accordion-section">
          <div 
            className="accordion-header" 
            onClick={() => setPuestosOpen(!puestosOpen)}
          >
            <h3>Puestos</h3>
            <span>{puestosOpen ? "▲" : "▼"}</span>
          </div>
          {puestosOpen && (
            <div className="accordion-content">
              <div className="boton-item"><CrearPuesto /></div>
              <div className="boton-item"><BajaPuesto /></div>
              <div className="boton-item"><AltaPuesto /></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}