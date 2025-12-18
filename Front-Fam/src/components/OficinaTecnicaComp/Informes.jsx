import React, { useState, useEffect } from 'react';
import './Informes.css';
import API_URL from '../../services/api';


const InformeProduccion = () => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState('');
  const [desdeFecha, setDesdeFecha] = useState('');
  const [hastaFecha, setHastaFecha] = useState('');
  const [datos, setDatos] = useState([]);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const obtenerEmpleados = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/oficina/empleados`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Error al obtener empleados");

      const data = await response.json();
      setEmpleados(data);
    } catch (error) {
      console.error("Error al obtener empleados:", error);
    }
  };

  useEffect(() => {
    obtenerEmpleados();
  }, []);

  const buscarInforme = async () => {
    if (!empleadoSeleccionado || !desdeFecha || !hastaFecha) {
      alert("Completa todos los campos para buscar");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // Añadir hora al "hasta" para usar 23:59:59
      const hastaConHora = `${hastaFecha}T23:59:59`;

      const response = await fetch(`${API_URL}/oficina/informes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          empleado: empleadoSeleccionado,
          desde: desdeFecha,
          hasta: hastaConHora,
        }),
      });

      const data = await response.json();
      console.log("Datos recibidos:", data);
      setDatos(data);
    } catch (error) {
      console.error("Error al buscar datos:", error);
    }
    setBusquedaRealizada(true);
  };

  return (
    <div className="informe-container">
      <h2>Informe de Producción por Empleado</h2>
      <div className="filtros">
        <select
          value={empleadoSeleccionado}
          onChange={(e) => setEmpleadoSeleccionado(e.target.value)}
        >
          <option value="">Seleccionar empleado</option>
          {empleados.map((emp) => (
            <option key={emp.idEmpleado} value={emp.nombreCompleto}>
              {emp.nombreCompleto}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={desdeFecha}
          onChange={(e) => setDesdeFecha(e.target.value)}
        />
        <input
          type="date"
          value={hastaFecha}
          onChange={(e) => setHastaFecha(e.target.value)}
        />
        <button onClick={buscarInforme}>Buscar</button>
      </div>

      {busquedaRealizada && (
        datos.length > 0 ? (
          <table className="tabla-excel">
            <thead>
              <tr>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>Proceso</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Total Incidencias</th>
                <th>Descripcion incidencias</th>
                <th>Tiempo Estimado</th>
                <th>Tiempo Real</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((fila, index) => (
                <tr key={index}>
                  <td>{fila.apellidoEmpleado}</td>
                  <td>{fila.nombreEmpleado}</td>
                  <td>{fila.nombreProceso}</td>
                  <td>{fila.fechaInicio ? new Date(fila.fechaInicio).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : 'Sin iniciar'}</td>
                  <td>{fila.fechaFin ? new Date(fila.fechaFin).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : 'En curso'}</td>
                  <td>{fila.cantidadIncidencias}</td>
                  <td> {fila.descripcionesIncidenciasVistas
                      ? fila.descripcionesIncidenciasVistas.split(' || ').map((desc, i) => (
                          <div key={i}>{desc}</div>
                        ))
                      : 'Ninguna'}
                  </td>
                  <td>{fila.tiempoProduccionEstimado || 'N/A'}</td>
                  <td>{fila.tiempoProduccion || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
  ) : (
    <p style={{ marginTop: '20px', color: '#999', textAlign: 'center' }}>
      No hay datos para mostrar con esos filtros.
    </p>
  )
)}
    </div>
  );
};

export default InformeProduccion;