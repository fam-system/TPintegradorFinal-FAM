import React, { useState } from "react";
import "../Modal.css";
import API_URL from '../../services/api';

export default function CrearPuesto() {
    const [showModal, setShowModal] = useState(false);
    const [nombrePuesto, setNombrePuesto] = useState("");
    const [message, setMessage] = useState({ text: null, type: null }); 
    
    const updateMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: null, type: null }), 5000); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: null, type: null }); 

        // 1. Validación front-end
        const puestoTrimmed = nombrePuesto.trim();
        
        if (puestoTrimmed.length === 0) {
            updateMessage("El nombre del puesto es obligatorio.", 'error');
            return;
        }
        if (puestoTrimmed.length > 50) {
            updateMessage("El nombre del puesto no puede exceder los 50 caracteres.", 'error');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/oficina/puestos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ nombrePuesto: puestoTrimmed }),
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error("ERROR DEL BACKEND AL CREAR PUESTO:", errData);
                throw new Error(errData.error || "Error al crear el puesto");
            }

            const data = await response.json();
            
            // MODIFICACIÓN CLAVE: Usamos el nombre del puesto que se acaba de crear (puestoTrimmed)
            // junto con la confirmación (data.message) y el ID para ser más informativos.
            updateMessage(`Puesto "${puestoTrimmed}" creado correctamente`, 'success');
            
            setNombrePuesto("");
            setShowModal(false); 

        } catch (err) {
            console.error("Error en el submit:", err);
            updateMessage(err.message || "Error de conexión o permisos.", 'error'); 
        }
    };

    const handleClose = () => {
        setShowModal(false);
        setNombrePuesto("");
        setMessage({ text: null, type: null }); 
    };


    return (
        <div>
            <button className="boton-abrir crear-puesto" onClick={() => setShowModal(true)}>
                Crear Puesto
            </button>

            {message.text && <p className={`message message-${message.type}`}>{message.text}</p>}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h2>Nuevo Puesto</h2>
                        <form onSubmit={handleSubmit} className="formulario-empleado">
                            
                            <div className="form-grupo"> 
                                <input
                                    type="text"
                                    placeholder="Nombre del Puesto"
                                    value={nombrePuesto}
                                    onChange={(e) => setNombrePuesto(e.target.value)}
                                    required
                                    maxLength="50"
                                />
                            </div>

                            <div className="form-botones">
                                <button
                                    type="button"
                                    className="boton-cancelar"
                                    onClick={handleClose}
                                >
                                    Cancelar
                                </button>
                                <button type="submit" className="boton-guardar">
                                    Crear
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}