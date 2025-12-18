import React, { useState } from 'react';
import './Proceso.css'; 
import API_URL from '../../services/api';


function InformeProceso() {
  const [idProceso, setIdProceso] = useState('');
  const [informe, setInforme] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);

  const buscarInforme = () => {
    setError('');
    setInforme(null);
    setBusquedaRealizada(false);

    if (!idProceso.trim()) {
      setError('Debe ingresar un ID de proceso');
      return;
    }

    setCargando(true);

    fetch(`${API_URL}/oficina/informes/proceso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ idProceso }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('No se encontró el proceso');
        return res.json();
      })
      .then((data) => {
        setInforme(data);
        setBusquedaRealizada(true);
      })
      .catch((err) => {
        console.error(err);
        setError('No se pudo cargar el informe.');
      })
      .finally(() => {
        setCargando(false);
      });
  };

  return (
    <div className="informe-container">
      <h2>Informe Detallado de un Proceso</h2>

      <div className="filtros">
        <input
          type="number"
          placeholder="Ingrese ID de proceso"
          value={idProceso}
          onChange={(e) => setIdProceso(e.target.value)}
        />
        <button onClick={buscarInforme}>Buscar</button>
      </div>

      {cargando && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {busquedaRealizada && (
        informe ? (
          <table className="tabla-excel">
            <thead>
              <tr>
                <th>ID Proceso</th>
                <th>Nombre Proceso</th>
                <th>Empleado</th>
                <th>Incidencias</th>
                <th>Descripción Incidencias</th>
                <th>Tiempo Estimado</th>
                <th>Tiempo Real</th>
                <th>Entrega</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{informe.Numero}</td>
                <td>{informe['Nombre Proceso']}</td>
                <td>{informe.Apellido}, {informe.Nombre}</td>
                <td>{informe.Incidencias}</td>
                <td>
                  {informe['Descripcion Incidencias']
                    ? informe['Descripcion Incidencias'].split(' || ').map((desc, i) => (
                        <div key={i}>{desc}</div>
                      ))
                    : 'Sin incidencias'}
                </td>
                <td>{informe['Tiempo estimado']}</td>
                <td>{informe['Tiempo real']}</td>
                <td>{informe.Entrega ? new Date(informe.Entrega).toLocaleDateString() : 'Sin entregar'}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p style={{ marginTop: '20px', color: '#999', textAlign: 'center' }}>
            No se encontró el proceso con ese ID.
          </p>
        )
      )}
    </div>
  );
}

export default InformeProceso;