import React, { useState, useEffect } from "react";
import '../Modal.css';
import API_URL from '../../services/api';

function BajaPuesto() {
    const [puestos, setPuestos] = useState([]);
    const [selectedPuesto, setSelectedPuesto] = useState("");
    const [message, setMessage] = useState({ text: null, type: null }); 
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const updateMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: null, type: null }), 5000); 
    };

    // Cargar puestos activos al abrir el modal
    useEffect(() => {
        let mounted = true;
        async function fetchPuestos() {
            updateMessage(null, null);
            setLoading(true);
            try {
                const res = await fetch(`${API_URL}/oficina/puestos/activos`, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                });

                if (!res.ok) {
                    const text = await res.text();
                    console.error(`ERROR DEL BACKEND AL CARGAR PUESTOS: ${text}`); 
                    throw new Error(`Falló la carga de puestos. Revise sus permisos.`); 
                }

                const data = await res.json();
                if (mounted) {
                    setPuestos(data);
                }
            } catch (err) {
                console.error("Error fetch puestos activos:", err);
                if (mounted) updateMessage("Error al cargar los puestos activos. Intente de nuevo.", 'error');
            } finally {
                if (mounted) setLoading(false);
            }
        }

        if (showModal) fetchPuestos();

        return () => { mounted = false; };
    }, [showModal]);

    const handleBajaPuesto = async () => {
        updateMessage(null, null);
        if (!selectedPuesto) {
            updateMessage("Selecciona un puesto primero.", 'error');
            return;
        }

        // NUEVO: Buscar el puesto seleccionado por ID antes de la baja
        const puestoParaBaja = puestos.find(
            p => p.idPuesto === Number(selectedPuesto)
        );

        try {
            const res = await fetch(
                `${API_URL}/oficina/puestos/baja/${selectedPuesto}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                }
            );

            if (!res.ok) {
                const text = await res.text();
                console.error(`ERROR DEL BACKEND AL DAR DE BAJA EL PUESTO: ${text}`);
                throw new Error("No se pudo dar de baja el puesto. Revise el log.");
            }

            // Leemos el body (necesario)
            await res.json();
            
            // MODIFICACIÓN CLAVE: Usar el nombre del puesto en el mensaje
            if (puestoParaBaja) {
                 updateMessage(
                    `Puesto "${puestoParaBaja.nombrePuesto}" dado de baja correctamente.`, 
                    'success'
                 );
            } else {
                 updateMessage("Puesto dado de baja correctamente.", 'success');
            }
            
            // actualizar lista local
            setPuestos(prev => prev.filter(p => p.idPuesto !== Number(selectedPuesto)));
        } catch (err) {
            console.error("Error al dar de baja (frontend):", err);
            updateMessage(err.message || "Ocurrió un error inesperado al procesar la solicitud.", 'error');
        } finally {
            setShowModal(false);
            setSelectedPuesto("");
        }
    };

    return (
        <div>
            <button onClick={() => setShowModal(true)} className="boton-abrir baja-puesto">
                Baja Puesto
            </button>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h2>Baja de Puesto</h2>

                        {loading ? (
                            <p>Cargando puestos...</p>
                        ) : (
                            <>
                                <select
                                    value={selectedPuesto}
                                    onChange={(e) => setSelectedPuesto(e.target.value)}
                                >
                                    <option value="">Seleccione un puesto</option>
                                    {puestos.map((p) => (
                                        <option key={p.idPuesto} value={p.idPuesto}>
                                            {p.nombrePuesto}
                                        </option>
                                    ))}
                                </select>

                                <div className="form-botones">
                                    <button onClick={() => { setShowModal(false); setSelectedPuesto(""); }} className="boton-cancelar">
                                        Cancelar
                                    </button>
                                    <button onClick={handleBajaPuesto} className="boton-guardar" disabled={!selectedPuesto}>
                                        Confirmar Baja
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Renderizado del mensaje usando el nuevo estado */}
            {message.text && <p className={`message message-${message.type}`}>{message.text}</p>}
        </div>
    );
}

export default BajaPuesto;