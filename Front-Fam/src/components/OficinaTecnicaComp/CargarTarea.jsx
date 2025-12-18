import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useProductoSeleccionado } from './contextProducto';
import './CargarTarea.css';
import API_URL from '../../services/api';

function CargarTarea() {
  const { productos, setProductos } = useProductoSeleccionado();

  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_URL}/oficina/producto`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setProductos(data))
      .catch(err => console.error('Error al cargar productos:', err));
  }, [setProductos]);

  const handleCantidadChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,4}$/.test(value)) {
      setCantidad(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productoSeleccionado || !cantidad || !fechaEntrega) {
      alert('Todos los campos son obligatorios');
      return;
    }

    const producto = productos.find(p => p.idProducto === parseInt(productoSeleccionado));
    if (!producto) {
      alert('Producto no encontrado');
      return;
    }

    const nombreProceso = `${producto.nombreProducto}-${cantidad}`;

    const nuevoProceso = {
      idProducto: producto.idProducto,
      nombreProceso,
      cantidadProducto: parseInt(cantidad),
      estadoProducto: 'pendiente',
      fechaEntrega
    };

    try {
      const res = await fetch(`${API_URL}/oficina/proceso`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(nuevoProceso)
      });

      if (res.ok) {
        const creado = await res.json(); // <-- obtener el proceso creado del backend
        // Notificar a otros componentes que se creó un proceso
        window.dispatchEvent(new CustomEvent('procesoCreado', { detail: creado }));
        alert('Proceso creado exitosamente');
        setProductoSeleccionado('');
        setCantidad('');
        setFechaEntrega('');
      } else {
        const errorData = await res.json();
        alert(`Error al crear proceso: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (err) {
      console.error('Error de red:', err);
      alert('Error de red al crear el proceso');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="cargar-tarea-container">
      <div className="cargar-tarea-titulo-wrapper">
        <h5 className="monitoreo-titulo">Cargar Tarea</h5>
      </div>

      <Row className="align-items-center cargar-tarea-row">
        <Col xs="6">
          <Form.Group controlId="formProducto" className="d-flex align-items-center">
            <Form.Label className="mb-0 me-2">Producto:</Form.Label>
            <Form.Select
              value={productoSeleccionado}
              onChange={(e) => setProductoSeleccionado(e.target.value)}
              required
              className="cargar-tarea-select"
            >
              <option value="">Selecciona un producto</option>
              {productos.map((prod) => (
                <option key={prod.idProducto} value={prod.idProducto}>
                  {prod.nombreProducto}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs="4">
          <Form.Group controlId="formCantidad" className="d-flex align-items-center">
            <Form.Label className="mb-0 me-2">Cantidad:</Form.Label>
            <Form.Control
              type="text"
              value={cantidad}
              onChange={handleCantidadChange}
              maxLength={4}
              required
              className="cargar-tarea-input"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="align-items-center cargar-tarea-row mt-2">
        <Col xs="6">
          <Form.Group controlId="formFechaEntrega" className="d-flex align-items-center">
            <Form.Label className="mb-0 me-2">Entrega:</Form.Label>
            <Form.Control
              type="date"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              required
              className="cargar-tarea-input"
            />
          </Form.Group>
        </Col>

        <Col xs="2" className="d-flex align-items-end">
          <Button variant="primary" type="submit" className="cargar-tarea-boton">
            Cargar
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default CargarTarea;
