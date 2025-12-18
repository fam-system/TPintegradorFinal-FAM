import React, { useState, useEffect } from 'react';
import './AsignarTareas.css';
import API_URL from '../../services/api';

const AsignarTareas = () => {
  const [tarea, setTarea] = useState('');
  const [puesto, setPuesto] = useState('');
  const [empleado, setEmpleado] = useState('');
  const [tareas, setTareas] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [puestoOcupado, setPuestoOcupado] = useState(false);
  const [empleadoOcupado, setEmpleadoOcupado] = useState(false);

  const token = localStorage.getItem('token'); // Asegurate de tener el token guardado

  const fetchTareas = async () => {
    try {
      const res = await fetch(`${API_URL}/encargado/tareas`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      console.log('TAREAS:', data);

      setTareas(data);
    } catch (error) {
      console.error('Error al obtener tareas:', error);
    }
  };

  const fetchPuestos = async () => {
    try {
      const res = await fetch(`${API_URL}/encargado/puestos`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      console.log('PUESTOS:', data);
      setPuestos(data);
    } catch (error) {
      console.error('Error al obtener puestos:', error);
    }
  };

  const fetchEmpleados = async () => {
    try {
      const res = await fetch(`${API_URL}/encargado/empleados`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      console.log('EMPLEADOS:', data);
      setEmpleados(data);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
    }
  };

  useEffect(() => {
    fetchTareas();
    fetchPuestos();
    fetchEmpleados();
  }, []);

  const handlePuestoChange = (e) => {
    const selectedPuesto = e.target.value;
    setPuesto(selectedPuesto);
    setPuestoOcupado(false); // Lógica modificable si tenés puesto ocupado dinámico
  };

  const handleEmpleadoChange = (e) => {
    const selectedEmpleado = e.target.value;
    setEmpleado(selectedEmpleado);
    setEmpleadoOcupado(false); // Lógica modificable si tenés empleados ocupados dinámicos
  };

  const handleSubmit = async(e) => {
  console.log('Asignación enviada:', { tarea, puesto, empleado });
  e.preventDefault();

    if (!tarea || !puesto || !empleado) {
    alert('Por favor completá todos los campos antes de asignar la tarea.');
    return;
  }
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/encargado/asignar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        idProceso: tarea,
        idPuesto: puesto,
        idEmpleado: empleado
      })
    });

    if (!response.ok) throw new Error('Error al asignar la tarea');

    const data = await response.json();
    alert('Tarea asignada con éxito');
    setTarea('');
    setPuesto('');
    setEmpleado('');
    console.log(data);
  } catch (error) {
    console.error(error);
    alert('Error al asignar la tarea');
  }
};


  return (
    <div className="asignar-container">
      <h2 className="asignar-title">Asignar Tarea</h2>
      <form onSubmit={handleSubmit} className="asignar-form">

        <div className="form-group">
          <label className="form-label">Tarea:</label>
          <select className="form-select" onClick={fetchTareas} value={tarea} onChange={(e) => setTarea(e.target.value)}>
            <option value="">Seleccionar tarea</option>
            {tareas.map((t) => (
              <option key={t.idProceso} value={t.idProceso}>
                {t.nombreProceso} (x{t.cantidadProducto})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Puesto:</label>
          <select
            className={`form-select ${puestoOcupado ? 'ocupado' : ''}`} 
            value={puesto}
            onChange={handlePuestoChange}
            onClick={fetchPuestos}
          >
            <option value="">Seleccionar puesto</option>
            {puestos.map((p) => (
              <option key={p.idPuesto} value={p.idPuesto}>
                {p.nombrePuesto}
              </option>
            ))}
          </select>
          {puestoOcupado && <p className="warning-text">Este puesto está ocupado.</p>}
        </div>

        <div className="form-group">
          <label className="form-label">Empleado:</label>
          <select
            className={`form-select ${empleadoOcupado ? 'ocupado' : ''}`}
            value={empleado}
            onChange={handleEmpleadoChange}
            onClick={fetchEmpleados}
          >
            <option value="">Seleccionar empleado</option>
            {empleados.map((epl) => (
              <option key={epl.idEmpleado} value={epl.idEmpleado}>
                {epl.nombreEmpleado} {epl.apellidoEmpleado}
              </option>
            ))}
          </select>
          {empleadoOcupado && <p className="warning-text">Este empleado está ocupado.</p>}
        </div>

        <button type="submit" className="asignar-button">Asignar</button>
      </form>
    </div>
  );
};

export default AsignarTareas;