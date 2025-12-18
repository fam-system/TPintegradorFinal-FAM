import React, { useState } from 'react';
import '../App.css';
import Header from '../components/Header';
import CargarTarea from '../components/OficinaTecnicaComp/CargarTarea';
import Monitoreo from '../components/OficinaTecnicaComp/Monitoreo';
import CargarProductos from '../components/OficinaTecnicaComp/CargarProductos';
import Incidencias from '../components/OficinaTecnicaComp/Incidencias';
import ArchivoProductos from '../components/OficinaTecnicaComp/ArchivoProductos';
import Informes from '../components/OficinaTecnicaComp/Informes';
import InformesProceso from '../components/OficinaTecnicaComp/InformesProceso';
import { ProductoProvider, useProductoSeleccionado } from '../components/OficinaTecnicaComp/contextProducto';
import ComponenteBotones from '../components/OficinaTecnicaComp/ComponenteBotones';



function ContenidoTecnico({ setUser }) {
  const [productos, setProductos] = useState([]);
  const [archivos, setArchivos] = useState({});
  const { productoSeleccionado } = useProductoSeleccionado();

  const agregarProducto = (producto) => {
    setProductos((prev) => [...prev, producto]);
  };

  const eliminarProducto = (producto) => {
    setProductos((prev) => prev.filter((p) => p !== producto));
    setArchivos((prev) => {
      const newArchivos = { ...prev };
      delete newArchivos[producto];
      return newArchivos;
    });
  };

  const agregarArchivo = (archivo) => {
    if (!productoSeleccionado) return;
    setArchivos((prev) => {
      const archivosProducto = prev[productoSeleccionado] || [];
      return {
        ...prev,
        [productoSeleccionado]: [...archivosProducto, archivo],
      };
    });
  };

  const eliminarArchivo = (archivo) => {
    if (!productoSeleccionado) return;
    setArchivos((prev) => {
      const archivosProducto = prev[productoSeleccionado] || [];
      return {
        ...prev,
        [productoSeleccionado]: archivosProducto.filter((a) => a !== archivo),
      };
    });
  };

  return (
    <div className="app">
      <Header setUser={setUser} />
      <div className="Botones-container">
        <ComponenteBotones/>
      </div>
      <div className="superior-container">
        <CargarTarea productos={productos} />
        <Monitoreo productos={productos} />
      </div>
      <div className="productos-archivos-container">
        <CargarProductos
          productos={productos}
          agregarProducto={agregarProducto}
          eliminarProducto={eliminarProducto}
        />
        <ArchivoProductos
          archivos={productoSeleccionado ? archivos[productoSeleccionado] || [] : []}
          agregarArchivo={agregarArchivo}
          eliminarArchivo={eliminarArchivo}
        />
        <Incidencias />
      </div>
      <Informes />
      <InformesProceso/>

    </div>
  );
}

export default function OficinaTecnica({ setUser }) {
  return (
    <ProductoProvider>
      <ContenidoTecnico setUser={setUser} />
    </ProductoProvider>
  );
}
