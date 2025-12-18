import React, { useState, useEffect } from 'react';
import '../Modal.css';
import API_URL from '../../services/api';

const EmpleadoNuevo = () => {
    const [mostrarModal, setMostrarModal] = useState(false);
    const [roles, setRoles] = useState([]);
    const [errores, setErrores] = useState({});
    // NUEVO ESTADO: Para manejar el mensaje de éxito/error después del cierre del modal
    const [message, setMessage] = useState({ text: null, type: null }); 

    const abrirModal = () => {
        setMostrarModal(true);
        setMessage({ text: null, type: null }); 
    }

    const cerrarModal = () => {
        setMostrarModal(false);
        setErrores({}); 
    };

    const updateMessage = (text, type) => {
        setMessage({ text, type });
        // Limpia el mensaje después de 5 segundos
        setTimeout(() => setMessage({ text: null, type: null }), 5000); 
    };

    // Carga de roles
    useEffect(() => {
        if (mostrarModal) {
            const token = localStorage.getItem('token');
            fetch(`${API_URL}/oficina/roles`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Error en la autenticación o en la petición');
                    return res.json();
                })
                .then(data => {
                    setRoles(data);
                })
                .catch(err => {
                    console.error('Error al obtener roles:', err);
                    updateMessage("Error al cargar los roles. Intente refrescar la página.", 'error');
                });
        }
    }, [mostrarModal]);

    // Función de validación ajustada (solo obligatoriedad y longitud)
    const validarCampo = (fieldName, value, maxLength) => {
        let error = '';
        if (value.length === 0) {
            error = `El campo ${fieldName} es obligatorio.`;
        } else if (value.length > maxLength) {
            error = `El campo ${fieldName} no puede exceder los ${maxLength} caracteres.`;
        }
        return error;
    };

    const manejarSubmit = (e) => {
        e.preventDefault();
        
        // 1. Recolección de Datos
        const form = e.target;
        const nombreEmpleado = form.nombreEmpleado.value.trim();
        const apellidoEmpleado = form.apellidoEmpleado.value.trim();
        const dniEmpleado = form.dniEmpleado.value.trim();
        const direccionEmpleado = form.direccionEmpleado.value.trim();
        const telefonoEmpleado = form.telefonoEmpleado.value.trim();
        const nombreUsuario = form.nombreUsuario.value.trim();
        const pass = form.pass.value;
        const idRol = form.idRol.value;

        // 2. Validación
        let nuevosErrores = {};
        
        nuevosErrores.nombreEmpleado = validarCampo('Nombre', nombreEmpleado, 50);
        nuevosErrores.apellidoEmpleado = validarCampo('Apellido', apellidoEmpleado, 50);
        nuevosErrores.dniEmpleado = validarCampo('DNI', dniEmpleado, 11);
        nuevosErrores.direccionEmpleado = validarCampo('Dirección', direccionEmpleado, 255);
        nuevosErrores.telefonoEmpleado = validarCampo('Teléfono', telefonoEmpleado, 10);
        nuevosErrores.nombreUsuario = validarCampo('Usuario', nombreUsuario, 50);
        nuevosErrores.pass = validarCampo('Contraseña', pass, 255);
        

        if (!idRol) {
            nuevosErrores.idRol = 'Debe seleccionar un Rol.';
        }
        
        nuevosErrores = Object.fromEntries(
            Object.entries(nuevosErrores).filter(([_, v]) => v)
        );

        setErrores(nuevosErrores);

        if (Object.keys(nuevosErrores).length > 0) {
            console.error("Formulario con errores, no se envía.");
            return;
        }

        const token = localStorage.getItem('token');

        fetch(`${API_URL}/oficina/newempleado`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                nombreEmpleado,
                apellidoEmpleado,
                dniEmpleado,
                direccionEmpleado,
                telefonoEmpleado,
                nombreUsuario,
                pass,
                idRol: Number(idRol)
            })
        })
            .then(res => {
                if (!res.ok) {
                    // Si el backend responde con error, lanza una excepción que será capturada en el catch
                    return res.json().then(errData => {
                        console.error('Error del Backend:', errData);
                        throw new Error(errData.error || `Error ${res.status}: Falló la carga del empleado.`);
                    });
                }
                return res.json();
            })
            .then(data => {
                // ÉXITO: Si el backend devuelve un ID, lo usamos en el mensaje
                const nombreCompleto = `${nombreEmpleado} ${apellidoEmpleado}`;
                const mensajeExito = data.idEmpleado 
                    ? `Empleado: ${nombreCompleto} cargado correctamente.`
                    : `Empleado cargado exitosamente.`;
                    
                updateMessage(mensajeExito, 'success');
                console.log('Empleado creado exitosamente:', data);
                cerrarModal();
            })
            .catch(err => {
                // CATCH: Maneja errores de red o errores lanzados desde el .then()
                console.error('Error en la solicitud POST:', err);
                updateMessage(err.message || "Ocurrió un error de conexión inesperado.", 'error');
            });
    };

    return (
        <div>
            <button className="boton-abrir cargar-empleado" onClick={abrirModal}>Cargar Empleado</button>
            
            {/* Mensaje de feedback se muestra fuera del modal */}
            {message.text && <p className={`message message-${message.type}`}>{message.text}</p>}

            {mostrarModal && (
                <div className="modal-overlay">
                    <div className="modal-contenido">
                        <h2>Datos Nuevo Empleado</h2>
                        <form onSubmit={manejarSubmit} className="formulario-empleado">
                            
                            {/* Campos del Formulario (JSX) con validación */}
                            <div className="form-grupo">
                                <label>Nombre:</label>
                                <input type="text" name="nombreEmpleado" maxLength="50" required />
                                {errores.nombreEmpleado && <p className="mensaje-error">{errores.nombreEmpleado}</p>}
                            </div>

                            <div className="form-grupo">
                                <label>Apellido:</label>
                                <input type="text" name="apellidoEmpleado" maxLength="50" required />
                                {errores.apellidoEmpleado && <p className="mensaje-error">{errores.apellidoEmpleado}</p>}
                            </div>

                            <div className="form-grupo">
                                <label>DNI:</label>
                                <input type="text" name="dniEmpleado" maxLength="11" required />
                                {errores.dniEmpleado && <p className="mensaje-error">{errores.dniEmpleado}</p>}
                            </div>

                            <div className="form-grupo">
                                <label>Dirección:</label>
                                <input type="text" name="direccionEmpleado" maxLength="255" required />
                                {errores.direccionEmpleado && <p className="mensaje-error">{errores.direccionEmpleado}</p>}
                            </div>

                            <div className="form-grupo">
                                <label>Teléfono: </label>
                                <input type="text" name="telefonoEmpleado" maxLength="10" required />
                                {errores.telefonoEmpleado && <p className="mensaje-error">{errores.telefonoEmpleado}</p>}
                            </div>

                            <div className="form-grupo">
                                <label>Usuario:</label>
                                <input type="text" name="nombreUsuario" maxLength="50" required />
                                {errores.nombreUsuario && <p className="mensaje-error">{errores.nombreUsuario}</p>}
                            </div>

                            <div className="form-grupo">
                                <label>Contraseña:</label>
                                <input type="text" name="pass" maxLength="255" required />
                                {errores.pass && <p className="mensaje-error">{errores.pass}</p>}
                            </div>

                            <div className="form-grupo">
                                <label>Rol:</label>
                                <select name="idRol" required defaultValue="">
                                    <option value="" disabled>Seleccionar rol</option>
                                    {roles.map((rol) => {
                                        let nombreVisible = '';
                                        if (rol.idRol === 2) nombreVisible = 'Encargado';
                                        else if (rol.idRol === 1) nombreVisible = 'Administrador';
                                        else if (rol.idRol === 3) nombreVisible = 'Oficina';
                                        else if (rol.idRol === 4) nombreVisible = 'Operario';
                                        else nombreVisible = rol.nombreRol;

                                        return (
                                            <option key={rol.idRol} value={rol.idRol}>
                                                {nombreVisible}
                                            </option>
                                        );
                                    })}
                                </select>
                                {errores.idRol && <p className="mensaje-error">{errores.idRol}</p>}
                            </div>

                            <div className="form-botones">
                                <button type="button" onClick={cerrarModal} className="boton-cancelar">Cancelar</button>
                                <button type="submit" className="boton-guardar">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmpleadoNuevo;


