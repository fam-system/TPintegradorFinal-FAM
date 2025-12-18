import React, { useState, useEffect, useRef } from 'react';
import './TareaOperario.css';
import API_URL from '../../services/api';

const TareaOperario = ({ taskStarted, onStart, onEnd, onTiempoFinalizado }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const [tareas, setTareas] = useState([]);

  const fetchTareas = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      console.error('No se encontró el usuario o token en localStorage.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/operario/inicio/${user.idUsuario}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error al obtener las tareas');

      const dataTarea = await response.json();
console.log('Datos de tareas recibidos:', dataTarea);
      if (dataTarea.length === 0) {
        setTareas([]);
        console.warn('No hay tareas pendientes para el usuario.');
        return;
      }

      setTareas(dataTarea);
      console.log('Tareas obtenidas:', dataTarea);
    } catch (error) {
      console.error('Error en fetchTareas:', error);
    }
  };

  useEffect(() => {
    fetchTareas();
  }, []);
  const tareaPendiente = tareas.find(t => t.estadoProducto === 'asignado' || t.estadoProducto === 'produccion');
console.log('Tarea pendiente actual:', tareaPendiente);
console.log('cantidad:', tareaPendiente?.cantidadProducto)
  // Cargar segundos desde la tarea al montar
  useEffect(() => {
    if (!tareaPendiente) return;

    let segundos = 0;

    if (typeof tareaPendiente.tiempoProduccion === 'string') {
      const [h, m, s] = tareaPendiente.tiempoProduccion.split(':').map(Number);
      segundos = h * 3600 + m * 60 + s;
    } else if (typeof tareaPendiente.tiempoProduccion === 'number') {
      segundos = tareaPendiente.tiempoProduccion;
    }

    console.log('Tiempo cargado desde API:', segundos);
    setSeconds(segundos);
  }, [tareaPendiente]);

  useEffect(() => {
    if (onTiempoFinalizado) {
      onTiempoFinalizado(seconds);
    }
  }, [seconds, onTiempoFinalizado]);

  // Cronómetro
  useEffect(() => {
    if (tareaPendiente && taskStarted) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [tareaPendiente, taskStarted]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

    // Función para convertir "HH:MM:SS" a segundos
  const timeStringToSeconds = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const [h, m, s] = timeStr.split(':').map(Number);
    return h * 3600 + m * 60 + s;
  };

  // Función para formatear segundos a "HH:MM:SS"
  const formatTimeTotal = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds <= 0) return 'N/D';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleStartClick = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token || !tareaPendiente) {
      console.error('No se encontró el usuario, token o tarea válida.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/operario/iniciartarea`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ idUsuario: user.idUsuario })
      });

      if (!response.ok) throw new Error('Error al iniciar la tarea');

      console.log('Tarea iniciada correctamente');
      onStart();
    } catch (error) {
      console.error('Error al iniciar la tarea:', error);
    }
  };
console.log('idproceso:', tareaPendiente?.idProceso);
  const handleEndClick = () => {
    setShowModal(true);
  };

  const handleConfirm = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token || !tareaPendiente) {
      console.error('No se encontró el usuario, token o tarea válida.');
      return;
    }
console.log('Finalizando tarea con segundos:', tareaPendiente, seconds);
    try {
      const response = await fetch(`${API_URL}/operario/finalizartarea`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          idUsuario: user.idUsuario,
          tiempoProduccion: seconds,
          idProceso: tareaPendiente.idProceso
        })
      });

      if (!response.ok) throw new Error('Error al finalizar la tarea');

      if (onTiempoFinalizado) {
        onTiempoFinalizado(seconds);
      }

      console.log('Tarea finalizada correctamente');
      setSeconds(0);     // Reinicia el contador
      onEnd();           // Notifica que terminó
      await fetchTareas(); // Recarga las tareas

    } catch (error) {
      console.error('Error al finalizar la tarea:', error);
    }

    setShowModal(false);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <div className="task-wrapper">
      <div className="task-section-horizontal">
        <button
          className="start-task"
          onClick={handleStartClick}
          disabled={!tareaPendiente || taskStarted}
        >
          Iniciar Tarea
        </button>

        <div className="timer-compact">
          <span className="timer-label">Tiempo:</span>
          <span className="timer-value">{formatTime(seconds)}</span>
        </div>

        <div className="implemento-info">
          {tareaPendiente 
            ? (
            <>
          {tareaPendiente.nombreProducto}
          <br /> 
          Cant: {tareaPendiente.cantidadProducto}
          </>
          ) 
          : '' 
          }
        </div>

        <div className="timer-estimado">
          <span className="timer-label">Tiempo estimado:</span>
          <span className="timer-value">
            {tareaPendiente ? formatTimeTotal(timeStringToSeconds(tareaPendiente.tiempoProduccionEstimado) * tareaPendiente.cantidadProducto) : 'N/D'}
            </span>
        </div>

        <button
          className="end-task"
          onClick={handleEndClick}
          disabled={!tareaPendiente || (!taskStarted && seconds === 0)}
        >
          Finalizar Tarea
        </button>
      </div>

      {showModal && (
        <div className="modal-wrapper">
          <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close-button" onClick={handleClose} aria-label="Cerrar modal">×</button>
            <h3 id="modal-title">¿Estás seguro que quieres Finalizar tu tarea?</h3>
            <button className="modal-ok-button" onClick={handleConfirm}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TareaOperario;
