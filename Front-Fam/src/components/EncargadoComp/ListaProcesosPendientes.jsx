import React, { useEffect, useState } from 'react';
import './ListaProcesosPendientes.css';
import API_URL from '../../services/api';

const ListaProcesosPendientes = () => {
  const [procesosPendientes, setProcesosPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcesos = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/encargado/pendientes`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        setProcesosPendientes(data);
      } catch (error) {
        console.error('Error al obtener los procesos pendientes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProcesos();
  }, []);

  return (
    <div className="procesos-container">
      <h2 className="procesos-title">Procesos Pendientes</h2>

      {loading ? (
        <p>Cargando procesos...</p>
      ) : procesosPendientes.length === 0 ? (
        <p>No hay procesos pendientes.</p>
      ) : (
        <div className="procesos-list">
          {procesosPendientes.map((proceso, index) => (
            <div key={index} className="procesos-item">
              <p><strong>Proceso:</strong> {proceso.nombreProceso}</p>
              <p><strong>Producto:</strong> {proceso.nombreProducto}</p>
              <p><strong>Cantidad:</strong> {proceso.cantidadProducto}</p>
              <p><strong>Fecha de Entrega:</strong> {new Date(proceso.fechaEntrega).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListaProcesosPendientes;