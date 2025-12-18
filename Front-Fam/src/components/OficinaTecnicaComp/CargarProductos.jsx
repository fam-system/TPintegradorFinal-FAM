import React, { useEffect, useState } from 'react';
import { useProductoSeleccionado } from './contextProducto';
import './CargarProductos.css';
import Modal from '../Modal';
import API_URL from '../../services/api';

function CargarProductos() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [paso, setPaso] = useState(1);
  const [nombreProducto, setNombreProducto] = useState('');
  const [tiempoProduccion, setTiempoProduccion] = useState('');
  const [cargando, setCargando] = useState(true);

  const {
    productoSeleccionado,
    setProductoSeleccionado,
    productos,
    setProductos,
    agregarProducto,
    eliminarProducto,
  } = useProductoSeleccionado();

  useEffect(() => {
    fetch(`${API_URL}/oficina/producto`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al obtener productos');
        return res.json();
      })
      .then((data) => {
        setProductos(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setCargando(false));
  }, []);

  const handleAgregar = () => {
    setNombreProducto('');
    setTiempoProduccion('');
    setErrorModal('');
    setPaso(1);
    setModalAbierto(true);
  };

  const valorInput = paso === 1 ? nombreProducto : tiempoProduccion;

  const handleConfirmar = (valor) => {
    if (paso === 1) {
      const nombreLimpio = valor.trim();
      if (!nombreLimpio) {
        setErrorModal('El nombre no puede estar vacío');
        return;
      }
      if (productos.some((p) => p.nombreProducto === nombreLimpio)) {
        setErrorModal('El producto ya existe');
        return;
      }
      setNombreProducto(nombreLimpio);
      setErrorModal('');
      setPaso(2);
      setTiempoProduccion('');
    } else {
      const tiempoLimpio = valor.trim();
      const regexTiempo = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      if (!regexTiempo.test(tiempoLimpio)) {
        setErrorModal('El formato debe ser HH:MM (ejemplo: 02:30)');
        return;
      }

      fetch(`${API_URL}/oficina/productos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          nombreProducto: nombreProducto,
          tiempoProduccionEstimado: tiempoLimpio,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('No se pudo agregar el producto');
          return res.json();
        })
        .then((nuevoProducto) => {
          console.log('Producto creado:', nuevoProducto);
          agregarProducto(nuevoProducto);
          setProductoSeleccionado(nuevoProducto); // <<<<<< Esto es lo que faltaba
          setModalAbierto(false);
        })
        .catch((err) => {
          console.error(err);
          setErrorModal('Error al agregar el producto');
        });
    }
  };

  const handleCerrar = () => {
    setModalAbierto(false);
    setErrorModal('');
    setPaso(1);
    setNombreProducto('');
    setTiempoProduccion('');
  };

  return (
    <div className="cargar-productos-container">
      <h5>Productos</h5>
      <div className="lista-productos">
        {cargando ? (
          <p>Cargando productos...</p>
        ) : productos.length === 0 ? (
          <p>No hay productos agregados.</p>
        ) : (
          <ul>
            {productos.map((producto) => (
              <li
                key={producto.idProducto}
                className={productoSeleccionado?.idProducto === producto.idProducto ? 'seleccionado' : ''}
                onClick={() => setProductoSeleccionado(producto)}
              >
                {producto.nombreProducto}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="botones">
        <button onClick={handleAgregar}>Agregar</button>
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={handleCerrar}
        onConfirm={handleConfirmar}
        title={paso === 1 ? 'Nombre del producto' : 'Tiempo estimado (formato HH:MM)'}
        placeholder={paso === 1 ? 'Ej: Producto A' : 'Ej: 02:30'}
        error={errorModal}
        inputType={paso === 1 ? 'text' : 'time'}
        value={valorInput}
        onChange={(valorNuevo) => {
          if (paso === 1) setNombreProducto(valorNuevo);
          else setTiempoProduccion(valorNuevo);
        }}
      />
    </div>
  );
}

export default CargarProductos;