import { createContext, useContext, useState } from 'react';

const contextProducto = createContext();

export const ProductoProvider = ({ children }) => {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productos, setProductos] = useState([]);
  const [archivosPorProducto, setArchivosPorProducto] = useState({});

  const agregarProducto = (productoNuevo) => {
    setProductos((prev) => {
      const yaExiste = prev.some(p => p.idProducto === productoNuevo.idProducto);
      return yaExiste ? prev : [...prev, productoNuevo];
    });
  };

  const eliminarProducto = (producto) => {
    setProductos((prev) => prev.filter((p) => p.idProducto !== producto.idProducto));
    setArchivosPorProducto((prev) => {
      const copia = { ...prev };
      delete copia[producto.idProducto];
      return copia;
    });
  };

  const agregarArchivo = (idProducto, archivo) => {
    setArchivosPorProducto((prev) => ({
      ...prev,
      [idProducto]: [...(prev[idProducto] || []), archivo],
    }));
  };

  const eliminarArchivo = (idProducto, archivoAEliminar) => {
    setArchivosPorProducto((prev) => ({
      ...prev,
      [idProducto]: prev[idProducto]?.filter(a => a.idPlano !== archivoAEliminar.idPlano),
    }));
  };

  return (
    <contextProducto.Provider value={{
      productoSeleccionado,
      setProductoSeleccionado,
      productos,
      setProductos,
      agregarProducto,
      eliminarProducto,
      archivosPorProducto,
      agregarArchivo,
      eliminarArchivo,
      setArchivosPorProducto,
    }}>
      {children}
    </contextProducto.Provider>
  );
};

export const useProductoSeleccionado = () => useContext(contextProducto);