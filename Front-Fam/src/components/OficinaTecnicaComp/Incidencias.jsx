import React, { useEffect, useState } from "react";
import "./Incidencias.css";
import API_URL from '../../services/api';

const Incidencias = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [pagina, setPagina] = useState(0);

  useEffect(() => {
    const fetchIncidencias = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/oficina/incidencias/nuevas`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener incidencias");

        const data = await response.json();
        console.log("Incidencias obtenidas:", data);
        setIncidencias(data);
        setPagina(0);
      } catch (error) {
        console.error("Error al obtener incidencias:", error);
      }
    };

    fetchIncidencias();
  }, []);

  if (incidencias.length === 0) {
    return (
      <div className="incidencias-container">
        <div className="incidencias-header-row">
          <h5>Incidencias</h5>
        </div>
        <div className="incidencia-vacia">No hay incidencias pendientes.</div>
      </div>
    );
  }

  const incidencia = incidencias[pagina];

  // Marca incidencia como vista
  const handleVisto = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/oficina/incidencias/${incidencia.idIncidencia}/vista`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al actualizar incidencia");
      else {console.log ("Incidencia marcada como vista")}

      // Remover incidencia vista de la lista local
      const nuevas = incidencias.filter((_, idx) => idx !== pagina);
      setIncidencias(nuevas);
      setPagina((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error) {
      console.error("Error al marcar incidencia como vista:", error);
    }
  };

  const handleAnterior = () => setPagina((prev) => (prev > 0 ? prev - 1 : prev));
  const handleSiguiente = () =>
    setPagina((prev) => (prev < incidencias.length - 1 ? prev + 1 : prev));

  return (
    <div className="incidencias-container">
      <div className="incidencias-header-row">
        <h5>Incidencias</h5>
        <div className="incidencias-header-nav">
          <button
            type="button"
            className="nav-btn"
            onClick={handleAnterior}
            disabled={pagina === 0}
          >
            {'<'}
          </button>
          <span className="incidencias-paginador">
            {pagina + 1}/{incidencias.length}
          </span>
          <button
            type="button"
            className="nav-btn"
            onClick={handleSiguiente}
            disabled={pagina === incidencias.length - 1}
          >
            {'>'}
          </button>
        </div>
      </div>

      <form className="form-incidencia">
        <div className="fila-doble">
          <div className="alineado-row">
            <label>Incidencia:</label>
            <input type="text" value={incidencia.tipoIncidencia} readOnly />
          </div>
          <div className="alineado-row">
  <label>Proceso:</label>
  <input
    type="text"
    value={incidencia.nombreProducto ? incidencia.nombreProducto : "encargado"}
    readOnly
  />
</div>
        </div>
        <div className="descripcion-div">
          <label>Descripción:</label>
          <textarea rows={4} value={incidencia.descripcion} readOnly />
        </div>
        <button type="button" className="visto-btn" onClick={handleVisto}>
          Visto
        </button>
      </form>
    </div>
  );
};

export default Incidencias;