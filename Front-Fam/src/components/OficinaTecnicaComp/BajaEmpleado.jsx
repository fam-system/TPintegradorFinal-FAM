import React, { useState, useEffect } from "react";
import '../Modal.css';
import API_URL from '../../services/api';

// Usaremos un objeto para el estado del mensaje para gestionar el tipo (éxito/error)
// { text: string, type: 'success' | 'error' | null }

function BajaEmpleado() {
    const [empleados, setEmpleados] = useState([]);
    const [selectedEmpleado, setSelectedEmpleado] = useState("");
    const [message, setMessage] = useState({ text: null, type: null }); 
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    // Función auxiliar para actualizar el mensaje de forma más limpia
    const updateMessage = (text, type) => {
        setMessage({ text, type });
        // Limpiar el mensaje después de 3.5 segundos
        setTimeout(() => setMessage({ text: null, type: null }), 5000); 
    }

    // Cargar empleados activos al abrir el modal
    useEffect(() => {
        let mounted = true;
        async function fetchEmpleados() {
            updateMessage(null, null); // Limpiar mensaje antes de cargar
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/oficina/empleados/activos`, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                });

                console.log("GET /empleados/activos status:", res.status);

                if (!res.ok) {
                    const text = await res.text();
                    console.error(`ERROR DEL BACKEND AL CARGAR EMPLEADOS: ${text}`); 
                    throw new Error(`Error ${res.status}: Falló la autenticación o la petición de datos.`);
                }

                const data = await res.json();
                if (mounted) {
                    const filtrados = data.filter(e => e.nombreEmpleado && e.apellidoEmpleado);
                    setEmpleados(filtrados);
                }
            } catch (err) {
                console.error("Error fetch empleados activos:", err);
                if (mounted) updateMessage("Error al cargar empleados activos. Por favor, inténtelo de nuevo.", 'error');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        if (showModal) fetchEmpleados();
        return () => { mounted = false; };
    }, [showModal]);

    const handleBajaEmpleado = async () => {
        updateMessage(null, null); // Limpiar mensaje antes de la baja
        if (!selectedEmpleado) {
            updateMessage("Selecciona un empleado primero.", 'error'); 
            return;
        }

        // NUEVO: Buscar el empleado seleccionado por ID antes de la baja
        const empleadoParaBaja = empleados.find(
            e => e.idEmpleado === Number(selectedEmpleado)
        );

        try {
            const res = await fetch(
                `${API_URL}/oficina/empleados/baja/${selectedEmpleado}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                }
            );

            console.log("PUT /empleados/baja/:id status:", res.status);

            if (!res.ok) {
                const text = await res.text();
                console.error(`ERROR DEL BACKEND AL DAR DE BAJA: ${text}`); 
                throw new Error("No se pudo completar la baja. Verifique permisos o el estado del empleado.");
            }

            // const data = await res.json(); // Leemos el body (necesario aunque no usemos data)
            await res.json();

            // MODIFICACIÓN CLAVE: Usar el nombre y apellido en el mensaje
            if (empleadoParaBaja) {
                 updateMessage(
                    `Empleado ${empleadoParaBaja.nombreEmpleado} ${empleadoParaBaja.apellidoEmpleado} dado de baja correctamente.`, 
                    'success'
                 );
            } else {
                 updateMessage("Empleado dado de baja correctamente.", 'success');
            }
            
            // actualizar lista local
            setEmpleados(prev => prev.filter(e => e.idEmpleado !== Number(selectedEmpleado)));
            
        } catch (err) {
            console.error("Error al dar de baja (frontend):", err);
            updateMessage(err.message || "Ocurrió un error inesperado al procesar la solicitud.", 'error'); 
        } finally {
            setShowModal(false); 
            setSelectedEmpleado("");
        }
    };

    return (
        <div>
            <button onClick={() => setShowModal(true)} className="boton-abrir baja-empleado">
                Baja Empleado
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h2>Baja de Empleado</h2>
                        
                        {loading ? (
                            <p>Cargando empleados...</p>
                        ) : (
                            <>
                                <select
                                    value={selectedEmpleado}
                                    onChange={(e) => setSelectedEmpleado(e.target.value)}
                                >
                                    <option value="">Seleccione un empleado</option>
                                    {empleados.map(e => (
                                        <option key={e.idEmpleado} value={e.idEmpleado}>
                                            {e.nombreEmpleado} {e.apellidoEmpleado}
                                        </option>
                                    ))}
                                </select>

                                <div className="form-botones">
                                    <button
                                        onClick={() => { setShowModal(false); setSelectedEmpleado(""); }}
                                        className="boton-cancelar"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleBajaEmpleado}
                                        className="boton-guardar"
                                        disabled={!selectedEmpleado}
                                    >
                                        Confirmar Baja
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Renderizado del mensaje usando el nuevo estado 'message' */}
            {message.text && (
                <p className={`message message-${message.type}`}>{message.text}</p>
            )}
        </div>
    );
}

export default BajaEmpleado;