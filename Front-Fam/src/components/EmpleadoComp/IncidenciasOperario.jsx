import React, { useEffect, useState } from 'react';
import './IncidenciasOperario.css';
import './IncidenciasModal.css'; // <-- agregar esta línea
import API_URL from '../../services/api';

const IncidenciasOperario = ({
  incidence,
  onChange,
  type,
  onTypeChange,
  onSelectImage,
  selectedImage,
  showBuscarButton = false,
  onSuccess,
  rol = 4,
  idProceso
}) => {
  const [incidenceTypes, setIncidenceTypes] = useState([]);
  const [planos, setPlanos] = useState([]);
  const [internalIdProceso, setInternalIdProceso] = useState(1);
  const [productos, setProductos] = useState([]);
  const [nombreProductoSeleccionado, setNombreProductoSeleccionado] = useState('');
  
  // Estado para modal no bloqueante
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState(''); // 'success' o 'error'

  // Cargar tipos de incidencias
  useEffect(() => {
    const fetchIncidenceTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        let url;
        if (rol === 2) {
          url = `${API_URL}/encargado/tipoincidencias`;
        } else {
          url = `${API_URL}/operario/tipoincidencias`;
        }
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Error al obtener tipos de incidencias');
        const data = await response.json();
        if (Array.isArray(data)) setIncidenceTypes(data);
      } catch (error) {
        console.error('Error al hacer fetch:', error);
      }
    };
    fetchIncidenceTypes();
  }, [rol]);

  // Cargar productos solo para encargado (cuando showBuscarButton es true)
  useEffect(() => {
    if (!showBuscarButton) return;
    const fetchProductos = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const response = await fetch(`${API_URL}/encargado/productos`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) throw new Error('Error al obtener productos');
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error al obtener productos:', error);
      }
    };
    fetchProductos();
  }, [showBuscarButton]);

  // Cargar planos según el flujo
  useEffect(() => {
    const fetchPlanos = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      if (showBuscarButton && nombreProductoSeleccionado) {
        // Encargado: fetch de planos según producto seleccionado
        const response = await fetch(`${API_URL}/encargado/producto/${nombreProductoSeleccionado}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) return;
        const dataProducto = await response.json();
        setPlanos(dataProducto);
      } else if (!showBuscarButton && rol === 4) {
        // Operario: igual que antes
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;
        const response = await fetch(`${API_URL}/operario/producto/${user.idUsuario}`, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!response.ok) return;
        const dataProducto = await response.json();
        setPlanos(dataProducto);
      }
    };
    fetchPlanos();
  }, [showBuscarButton, nombreProductoSeleccionado, rol]);

  // Enviar incidencia (sin cambios)
  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const selected = incidenceTypes.find(t => t.tipoIncidencia === type);
      if (!selected) return;
      const proceso = rol === 2 ? idProceso : internalIdProceso;
      let url;
      if (rol === 2) {
        url = `${API_URL}/encargado/incidencia`;
      } else {
        url = `${API_URL}/operario/incidencia`;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idUsuario: JSON.parse(localStorage.getItem('user')).idUsuario,
          descripcion: incidence,
          idTipoIncidencia: selected.idTipoIncidencia
        })
      });
      if (!res.ok) throw new Error('Error al cargar la incidencia');
      
      // Usar modal no bloqueante en lugar de alert
      setModalMessage('Incidencia cargada correctamente');
      setModalType('success');
      
      // Auto-cerrar después de 2 segundos
      setTimeout(() => {
        setModalMessage('');
        if (onSuccess) onSuccess();
      }, 10000);
      
    } catch (err) {
      setModalMessage('Error al cargar la incidencia');
      setModalType('error');
      console.error(err);
      
      // Auto-cerrar después de 3 segundos
      setTimeout(() => {
        setModalMessage('');
      }, 10000);
    }
  };

  const closeModal = () => {
    setModalMessage('');
    // Reiniciar el componente limpiando estados
    if (modalType === 'success') {
      // Limpiar campos de incidencia
      onChange({ target: { value: '' } }); // vaciar textarea
      onTypeChange({ target: { value: '' } }); // vaciar select
      //setNombreProductoSeleccionado(''); // vaciar selector producto
      //setPlanos([]); // limpiar planos
      
      // Llamar onSuccess si existe (para que el padre también se reinicie)
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="product-info">
      {/* Modal no bloqueante */}
      {modalMessage && (
        <div className={`modal-overlay ${modalType}`}>
          <div className={`modal-content ${modalType}`}>
            <p>{modalMessage}</p>
            <button onClick={closeModal}>Cerrar</button>
          </div>
        </div>
      )}

      <div className="product-plan">
        <h3>Planos de Productos</h3>
        {showBuscarButton && (
          <div className="selector-producto">
            <select
              value={nombreProductoSeleccionado}
              onChange={e => setNombreProductoSeleccionado(e.target.value)}
            >
              <option value="">Seleccione un producto</option>
              {productos.map((prod, idx) => (
                <option key={idx} value={prod.nombreProducto}>
                  {prod.nombreProducto}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="plan-list">
          {planos.length > 0 ? (
            planos.map((plano, index) => (
              <button key={index} onClick={() => onSelectImage(plano.urlPlano)}>
                {plano.nombrePlano || `Plano ${index + 1}`}
              </button>
            ))
          ) : (
            <p>No hay planos disponibles</p>
          )}
        </div>
      </div>

      <div className="product-view">
        <h3>Vistas</h3>
        {selectedImage ? (
          <img src={selectedImage} alt="Vista seleccionada" />
        ) : (
          <p>Selecciona un plano para verlo aquí</p>
        )}
      </div>

      <div className="incident-section">
        <h3>Cargar Incidencia</h3>
        <select id="type" value={type} onChange={onTypeChange}>
          <option value="">Seleccione una opción</option>
          {incidenceTypes.map((tipo) => (
            <option key={tipo.idTipoIncidencia} value={tipo.tipoIncidencia}>
              {tipo.tipoIncidencia}
            </option>
          ))}
        </select>

        <textarea
          value={incidence}
          onChange={onChange}
          placeholder="Describe la incidencia..."
        />
        <button onClick={handleSubmit} disabled={!incidence || !type}>
          Cargar Incidencia
        </button>
      </div>
    </div>
  );
};

export default IncidenciasOperario;