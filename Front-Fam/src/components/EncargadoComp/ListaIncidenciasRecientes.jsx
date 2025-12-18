import React, { useEffect, useState } from 'react';
import './ListaIncidenciasRecientes.css';
import API_URL from '../../services/api';

const ListaIncidenciasRecientes = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState(null);
  const maxVisibleItems = 4;

  // Función para cargar incidencias desde el backend
  const cargarIncidencias = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("No hay token en el localStorage.");
      return;
    }

    try {
      const respuesta = await fetch(`${API_URL}/encargado/incidencias`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
      }

      const data = await respuesta.json();

      const adaptadas = data.map((item) => ({
        id: item.idIncidencia,
        tipo: item.tipoIncidencia,
        descripcion: item.descripcion,
        fecha: item.fechaIncidencia,
        puesto: item.nombrePuesto,
        empleado: `${item.nombreEmpleado} ${item.apellidoEmpleado}`
      }));

      setIncidencias(adaptadas);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    cargarIncidencias();
  }, []);

  const handleIncidenciaClick = (incidencia) => {
    setIncidenciaSeleccionada(incidencia);
  };

  const closeModal = () => {
    setIncidenciaSeleccionada(null);
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 > incidencias.length - maxVisibleItems ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? Math.max(0, incidencias.length - maxVisibleItems) : prevIndex - 1
    );
  };

  const handleDescartar = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/encargado/incidencias/${incidenciaSeleccionada.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await cargarIncidencias();
      setIncidenciaSeleccionada(null);
    } catch (err) {
      alert("Error al descartar la incidencia: " + err.message);
    }
  };

  const handleGuardar = async () => {
    const token = localStorage.getItem("token");
    try {
      await fetch(`${API_URL}/encargado/incidencias/${incidenciaSeleccionada.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: "guardado" }) // o cualquier estado que uses
      });

      await cargarIncidencias();
      setIncidenciaSeleccionada(null);
    } catch (err) {
      alert("Error al guardar la incidencia: " + err.message);
    }
  };

  const visibleIncidencias = incidencias.slice(currentIndex, currentIndex + maxVisibleItems);

  // -- CAMBIO: siempre renderizar el contenedor principal; mostrar mensajes internos --
  return (
    <div className="recientes-container">
      <h2 className="recientes-title">Incidencias Recientes</h2>

      <div className="recientes-carrusel">
        <button
          onClick={prevSlide}
          className="recientes-carrusel-button prev"
          disabled={incidencias.length === 0}
        >
          〈
        </button>

        <div className="recientes-grid">
          {error ? (
            <div className="reciente-card empty">
              <p className="error">Error al cargar incidencias: {error}</p>
            </div>
          ) : incidencias.length === 0 ? (
            <div className="reciente-card empty">
              <p className="info">No hay incidencias recientes.</p>
            </div>
          ) : (
            visibleIncidencias.map((incidencia) => (
              <div
                key={incidencia.id}
                className="reciente-card"
                onClick={() => handleIncidenciaClick(incidencia)}
              >
                <strong>{incidencia.tipo.split(" ")[0]}</strong>
                <span>{incidencia.tipo.split(" ")[1] || ''}</span>
                <small>{new Date(incidencia.fecha).toLocaleDateString()}</small>
              </div>
            ))
          )}
        </div>

        <button
          onClick={nextSlide}
          className="recientes-carrusel-button next"
          disabled={incidencias.length === 0}
        >
          〉
        </button>
      </div>

      {incidenciaSeleccionada && (
        <div className="reciente-modal">
          <div className="reciente-modal-content">
            <button onClick={closeModal} className="close-modal">×</button>
            <h3>{incidenciaSeleccionada.tipo}</h3>
            <p><strong>Descripción:</strong> {incidenciaSeleccionada.descripcion}</p>
            <p><strong>Fecha:</strong> {new Date(incidenciaSeleccionada.fecha).toLocaleDateString()}</p>
            <p><strong>Puesto:</strong> {incidenciaSeleccionada.puesto}</p>
            <p><strong>Empleado:</strong> {incidenciaSeleccionada.empleado}</p>
            <div className="modal-buttons">
              <button className="btn-cancel" onClick={handleDescartar}>Descartar</button>
              <button className="btn-save" onClick={handleGuardar}>Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaIncidenciasRecientes;

