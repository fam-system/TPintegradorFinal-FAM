import React, { useState, useEffect } from 'react';
import './ArchivoProductos.css';
import { useProductoSeleccionado } from './contextProducto';
import Modal from '../Modal';
import API_URL from '../../services/api';

function ArchivoProductos() {
  const [archivoSeleccionadoIndex, setArchivoSeleccionadoIndex] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [errorModal, setErrorModal] = useState('');
  const [inputNombre, setInputNombre] = useState('');
  const [inputUrl, setInputUrl] = useState('');

  const {
    productoSeleccionado,
    archivosPorProducto,
    setArchivosPorProducto,
    agregarArchivo,
  } = useProductoSeleccionado();

  const archivos = productoSeleccionado
    ? archivosPorProducto[productoSeleccionado.idProducto] || []
    : [];

  useEffect(() => {
    if (productoSeleccionado) {
      fetch(`${API_URL}/oficina/planos/${productoSeleccionado.idProducto}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('No se pudieron obtener los archivos');
          return res.json();
        })
        .then((data) => {
          setArchivosPorProducto((prev) => ({
            ...prev,
            [productoSeleccionado.idProducto]: data,
          }));
        })
        .catch((err) => {
          console.error('Error al cargar los archivos:', err);
        });
    }
  }, [productoSeleccionado]);

  const handleAgregar = () => {
    if (!productoSeleccionado) {
      setErrorModal('Debe seleccionar un producto');
      return;
    }
    setModalAbierto(true);
    setInputNombre('');
    setInputUrl('');
    setErrorModal('');
  };

  const handleConfirmar = () => {
    const nombre = inputNombre.trim();
    const url = inputUrl.trim();

    if (!nombre || !url) {
      setErrorModal('El nombre y la URL no pueden estar vacíos');
      return;
    }

    fetch(`${API_URL}/oficina/planos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        idProducto: productoSeleccionado.idProducto,
        nombrePlano: nombre,
        urlPlano: url,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al guardar el archivo');
        return res.json();
      })
      .then((nuevoArchivo) => {
        agregarArchivo(productoSeleccionado.idProducto, nuevoArchivo);
        setModalAbierto(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorModal('Error al agregar el archivo');
      });
  };

  const eliminarArchivo = (idProducto, archivo) => {
    fetch(`${API_URL}/oficina/planos/${archivo.idPlano}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Error al eliminar el archivo');
        return res.json();
      })
      .then(() => {
        // Eliminamos del estado local
        setArchivosPorProducto((prev) => {
          const nuevosArchivos = prev[idProducto].filter((a) => a.idPlano !== archivo.idPlano);
          return {
            ...prev,
            [idProducto]: nuevosArchivos,
          };
        });
      })
      .catch((err) => {
        console.error('Error al eliminar el archivo:', err);
        setErrorModal('Error al eliminar el archivo');
      });
  };

  const handleEliminar = () => {
  if (archivoSeleccionadoIndex !== null) {
      const archivo = archivos[archivoSeleccionadoIndex];
      eliminarArchivo(productoSeleccionado.idProducto, archivo);
      setArchivoSeleccionadoIndex(null);
    }
  };

  return (
    <div className="archivo-productos-container">
      <h5>Archivos</h5>

      {!productoSeleccionado ? (
        <p>Seleccioná un producto para ver sus archivos.</p>
      ) : (
        <>
          <div className="lista-archivos">
            {archivos.length === 0 ? (
              <p>No hay archivos agregados.</p>
            ) : (
              <ul>
                {archivos.map((archivo, index) => (
                  <li
                    key={archivo.idPlano}
                    className={archivoSeleccionadoIndex === index ? 'seleccionado' : ''}
                    onClick={() => setArchivoSeleccionadoIndex(index)}
                  >
                    {archivo.nombrePlano}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="botones">
            <button onClick={handleAgregar}>Agregar</button>
            <button onClick={handleEliminar} disabled={archivoSeleccionadoIndex === null}>
              Eliminar
            </button>
          </div>
        </>
      )}

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onConfirm={handleConfirmar}
        title="Agregar archivo al producto"
        placeholder="Nombre del archivo"
        value={inputNombre}
        onChange={setInputNombre}
        error={errorModal}
        extraFields={[
          {
            label: 'URL del archivo',
            value: inputUrl,
            onChange: setInputUrl,
            placeholder: 'https://...',
          },
        ]}
      />
    </div>
  );
}

export default ArchivoProductos;