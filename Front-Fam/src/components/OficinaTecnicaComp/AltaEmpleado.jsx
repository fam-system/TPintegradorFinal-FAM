import React, { useState, useEffect } from "react";
import '../Modal.css';
import API_URL from '../../services/api';

function AltaEmpleado() {
    const [empleados, setEmpleados] = useState([]);
    const [selectedEmpleado, setSelectedEmpleado] = useState("");
    const [message, setMessage] = useState({ text: null, type: null }); 
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const updateMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: null, type: null }), 5000); 
    };

    // Cargar empleados inactivos al abrir el modal
    useEffect(() => {
        let mounted = true;

        async function fetchEmpleados() {
            updateMessage(null, null);
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/oficina/empleados/inactivos`, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                });

                console.log("GET /empleados/inactivos status:", res.status);

                if (!res.ok) {
                    const text = await res.text();
                    console.error(`ERROR DEL BACKEND AL CARGAR EMPLEADOS INACTIVOS: ${text}`);
                    throw new Error(`Error ${res.status}: Falló la carga de empleados inactivos.`);
                }

                const data = await res.json();
                if (mounted) {
                    const filtrados = data.filter(e => e.nombreEmpleado && e.apellidoEmpleado);
                    setEmpleados(filtrados);
                }
            } catch (err) {
                console.error("Error fetch empleados inactivos:", err);
                if (mounted) updateMessage("Error al cargar empleados inactivos. Intente de nuevo.", 'error');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        if (showModal) fetchEmpleados();

        return () => { mounted = false; };
    }, [showModal]);

    // Dar de alta al empleado seleccionado
    const handleAltaEmpleado = async () => {
        updateMessage(null, null);
        if (!selectedEmpleado) {
            updateMessage("Selecciona un empleado primero.", 'error');
            return;
        }

        // NUEVO: Buscar el empleado seleccionado por ID
        const empleadoParaAlta = empleados.find(
            e => e.idEmpleado === Number(selectedEmpleado)
        );

        try {
            const res = await fetch(
                `${API_URL}/oficina/empleados/alta/${selectedEmpleado}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                }
            );

            console.log("PUT /empleados/alta/:id status:", res.status);

            if (!res.ok) {
                const text = await res.text();
                console.error(`ERROR DEL BACKEND AL DAR DE ALTA EL EMPLEADO: ${text}`);
                throw new Error("No se pudo completar el alta. Revise el log.");
            }

          
            await res.json(); // Leemos y descartamos la respuesta del body si no la usamos

            // MODIFICACIÓN CLAVE: Usar el nombre y apellido en el mensaje
            if (empleadoParaAlta) {
                 updateMessage(
                    `Empleado ${empleadoParaAlta.nombreEmpleado} ${empleadoParaAlta.apellidoEmpleado} dado de alta correctamente.`, 
                    'success'
                 );
            } else {
                 updateMessage("Empleado dado de alta correctamente.", 'success');
            }
            
            // Eliminar el empleado de la lista local
            setEmpleados(prev => prev.filter(e => e.idEmpleado !== Number(selectedEmpleado)));
            
        } catch (err) {
            console.error("Error al dar de alta (frontend):", err);
            updateMessage(err.message || "Ocurrió un error inesperado al procesar el alta.", 'error');
        } finally {
            setShowModal(false);
            setSelectedEmpleado("");
        }
    };

    return (
        <div>
            <button onClick={() => setShowModal(true)} className="boton-abrir alta-empleado">
                Alta Empleado
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h2>Alta de Empleado</h2>

                        {loading ? (
                            <p>Cargando empleados inactivos...</p>
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
                                        onClick={handleAltaEmpleado}
                                        className="boton-guardar"
                                        disabled={!selectedEmpleado}
                                    >
                                        Confirmar Alta
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {message.text && <p className={`message message-${message.type}`}>{message.text}</p>}
        </div>
    );
}

export default AltaEmpleado;