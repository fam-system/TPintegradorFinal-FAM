create database BaseFinal;


USE Basefinal;

-- Tabla: roles
CREATE TABLE roles (
    idRol INT AUTO_INCREMENT PRIMARY KEY,
    nombreRol varchar(60) not null unique
);

-- Tabla: empleados
CREATE TABLE empleados (
    idEmpleado INT AUTO_INCREMENT PRIMARY KEY,
    nombreEmpleado VARCHAR(50) NOT NULL,
    apellidoEmpleado VARCHAR(50) NOT NULL,
    dniEmpleado VARCHAR(11) NOT NULL,
    direccionEmpleado VARCHAR (255),
    telefonoEmpleado VARCHAR (10),
    fechaIngreso DATE NOT NULL,
    estadoEmpleado tinyint default '0',
    bajaEmpleado tinyint default '0'
   );

CREATE TABLE usuarios (
    idUsuario INT AUTO_INCREMENT PRIMARY KEY,
    idEmpleado INT NOT NULL,
    nombreUsuario VARCHAR(50) UNIQUE NOT NULL,
    pass VARCHAR(255) NOT NULL,  -- Guardar HASH, no texto plano
    idRol INT DEFAULT '4',
    FOREIGN KEY (idEmpleado) REFERENCES empleados(idEmpleado),
	FOREIGN KEY (idRol) REFERENCES roles(idRol)
);

CREATE TABLE planos (
	idPlano int AUTO_INCREMENT PRIMARY KEY,
    nombrePlano varchar(100) not null,
    urlPlano varchar(255) not null
);
    

-- Tabla: productos
CREATE TABLE productos (
    idProducto INT AUTO_INCREMENT PRIMARY KEY,
    nombreProducto VARCHAR(100),
    tiempoProduccionEstimado TIME NOT NULL
);



-- Tabla: procesos
CREATE TABLE procesos (
    idProceso INT AUTO_INCREMENT PRIMARY KEY,
    nombreProceso varchar (100),
    idProducto INT,
    fechaInicio DATETIME,
    fechaFin DATETIME,
    cantidadProducto int not null,
    estadoProducto ENUM ('pendiente', 'produccion', 'terminado','asignado'),
    FOREIGN KEY (idProducto) REFERENCES productos(idProducto)
);


-- Tabla: puestos
CREATE TABLE puestos (
    idPuesto INT AUTO_INCREMENT PRIMARY KEY,
    nombrePuesto VARCHAR(100)
);

CREATE TABLE trabajos (
	idTrabajo int auto_increment primary key,
    tiempoProduccion time,
    idPuesto int,
    idEmpleado int,
    idProceso int,
    foreign key (idEmpleado) references empleados(idEmpleado),
    foreign key (idPuesto) references puestos(idPuesto),
    foreign key (idProceso) references procesos(idProceso)
);

CREATE TABLE tiposIncidencias (
	idTipoIncidencia INT AUTO_INCREMENT PRIMARY KEY,
	tipoIncidencia VARCHAR(50)
);

-- Tabla: incidencias (relacionadas con procesos)
CREATE TABLE incidencias (
    idIncidencia INT AUTO_INCREMENT PRIMARY KEY,
    idTipoIncidencia INT,
    descripcion TEXT,
    
    idProceso INT,
    FOREIGN KEY (idProceso) REFERENCES procesos(idProceso),
    FOREIGN KEY (idTipoIncidencia) REFERENCES tiposIncidencias(idTipoIncidencia)
);
    
ALTER TABLE incidencias
ADD COLUMN fechaIncidencia TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE planos
ADD idProducto INT NOT NULL,
ADD CONSTRAINT fk_planos_productos FOREIGN KEY (idProducto) REFERENCES productos(idProducto);

ALTER TABLE procesos
ADD COLUMN fechaEntrega DATE;

CREATE INDEX idx_empleados_apellido_nombre
ON empleados (apellidoEmpleado, nombreEmpleado);

CREATE INDEX idx_procesos_fechaEntrega
ON procesos (fechaEntrega);


CREATE VIEW vista_proceso_empleado AS
SELECT
    empleados.apellidoEmpleado,
    empleados.nombreEmpleado,
    roles.nombreRol,
    productos.nombreProducto,
    productos.tiempoProduccionEstimado,
    trabajos.tiempoProduccion,
    procesos.fechaInicio,
    procesos.fechaFin,
    trabajos.idProceso
FROM trabajos
JOIN empleados ON trabajos.idEmpleado = empleados.idEmpleado
JOIN usuarios ON usuarios.idEmpleado = empleados.idEmpleado
JOIN roles ON usuarios.idRol = roles.idRol
JOIN procesos ON trabajos.idProceso = procesos.idProceso
JOIN productos ON procesos.idProducto = productos.idProducto;


CREATE VIEW vista_trabajos_ultimo_mes AS
SELECT
    empleados.apellidoEmpleado,
    empleados.nombreEmpleado,
    productos.nombreProducto,
    trabajos.tiempoProduccion,
    procesos.fechaInicio,
    procesos.fechaFin,
    trabajos.idProceso
FROM trabajos
JOIN empleados ON trabajos.idEmpleado = empleados.idEmpleado
JOIN procesos ON trabajos.idProceso = procesos.idProceso
JOIN productos ON procesos.idProducto = productos.idProducto
WHERE procesos.fechaInicio >= (NOW() - INTERVAL 30 DAY);


use BaseFinal;
alter table puestos 
ADD COLUMN disponible TINYINT DEFAULT '0';

alter table incidencias
add column vistaIncidencia tinyint default '0',
add column resueltaIncidencia tinyint default '0';

use BaseFinal;
CREATE VIEW vista_informe_produccion_empleado AS
SELECT
    e.apellidoEmpleado,
    e.nombreEmpleado,
    p.nombreProceso,
    p.fechaInicio,
    p.fechaFin,
    COUNT(i.idIncidencia) AS cantidadIncidencias,
    GROUP_CONCAT(
        CASE
            WHEN i.vistaIncidencia = 1 THEN i.descripcion
            ELSE NULL
        END
        SEPARATOR ' || '
    ) AS descripcionesIncidenciasVistas,
    p.idProceso,
    prod.tiempoProduccionEstimado,  -- tiempo estimado del producto
    t.tiempoProduccion              -- tiempo real del trabajo
FROM trabajos t
JOIN empleados e ON t.idEmpleado = e.idEmpleado
JOIN procesos p ON t.idProceso = p.idProceso
LEFT JOIN incidencias i ON i.idProceso = p.idProceso
LEFT JOIN productos prod ON p.idProducto = prod.idProducto  -- JOIN con productos
GROUP BY
    e.apellidoEmpleado,
    e.nombreEmpleado,
    p.nombreProceso,
    p.fechaInicio,
    p.fechaFin,
    p.idProceso,
    prod.tiempoProduccionEstimado,
    t.tiempoProduccion
ORDER BY
    e.apellidoEmpleado,
    e.nombreEmpleado;
    
    
use BaseFinal;
CREATE VIEW vista_informe_proceso_detallado AS
SELECT
    p.idProceso as Numero,
    p.nombreProceso as "Nombre Proceso",
    e.apellidoEmpleado as Apellido,
    e.nombreEmpleado as Nombre,
    COUNT(i.idIncidencia) AS Incidencias,
    GROUP_CONCAT(
        CONCAT(ti.tipoIncidencia, ': ', i.descripcion)
        SEPARATOR ' || '
    ) AS "Descripcion Incidencias",
    prod.tiempoProduccionEstimado as "Tiempo estimado",
    t.tiempoProduccion AS "Tiempo real",
    p.fechaEntrega as Entrega
FROM trabajos t
JOIN empleados e ON t.idEmpleado = e.idEmpleado
JOIN procesos p ON t.idProceso = p.idProceso
JOIN productos prod ON p.idProducto = prod.idProducto
LEFT JOIN incidencias i ON i.idProceso = p.idProceso
LEFT JOIN tiposIncidencias ti ON i.idTipoIncidencia = ti.idTipoIncidencia
GROUP BY
    p.idProceso,
    p.nombreProceso,
    e.apellidoEmpleado,
    e.nombreEmpleado,
    prod.tiempoProduccionEstimado,
    t.tiempoProduccion,
    p.fechaEntrega
ORDER BY
    p.idProceso,
    e.apellidoEmpleado,
    e.nombreEmpleado;

use BaseFinal;

alter table puestos
add column bajaPuesto tinyint default 0;

use BaseFinal;
ALTER VIEW vista_informe_proceso_detallado AS
SELECT
    p.idProceso as Numero,
    p.nombreProceso as "Nombre Proceso",
    e.apellidoEmpleado as Apellido,
    e.nombreEmpleado as Nombre,
    COUNT(i.idIncidencia) AS Incidencias,
    GROUP_CONCAT(
    CASE
            WHEN i.vistaIncidencia = 1 THEN CONCAT(ti.tipoIncidencia, ': ', i.descripcion)
            ELSE NULL
        END
        
        SEPARATOR ' || '
    ) AS "Descripcion Incidencias",
    SEC_TO_TIME(TIME_TO_SEC(prod.tiempoProduccionEstimado) * p.cantidadProducto) AS "Tiempo estimado",
    t.tiempoProduccion AS "Tiempo real",
    p.fechaEntrega as Entrega
FROM trabajos t
JOIN empleados e ON t.idEmpleado = e.idEmpleado
JOIN procesos p ON t.idProceso = p.idProceso
JOIN productos prod ON p.idProducto = prod.idProducto
LEFT JOIN incidencias i ON i.idProceso = p.idProceso
LEFT JOIN tiposIncidencias ti ON i.idTipoIncidencia = ti.idTipoIncidencia
GROUP BY
    p.idProceso,
    p.nombreProceso,
    e.apellidoEmpleado,
    e.nombreEmpleado,
    prod.tiempoProduccionEstimado,
    t.tiempoProduccion,
    p.fechaEntrega
ORDER BY
    p.idProceso,
    e.apellidoEmpleado,
    e.nombreEmpleado;

use BaseFinal;
ALTER VIEW vista_informe_produccion_empleado AS
SELECT
    e.apellidoEmpleado,
    e.nombreEmpleado,
    p.nombreProceso,
    p.fechaInicio,
    p.fechaFin,
    COUNT(i.idIncidencia) AS cantidadIncidencias,
    GROUP_CONCAT(
        CASE
            WHEN i.vistaIncidencia = 1 THEN i.descripcion
            ELSE NULL
        END
        SEPARATOR ' || '
    ) AS descripcionesIncidenciasVistas,
    p.idProceso,
    SEC_TO_TIME(TIME_TO_SEC(prod.tiempoProduccionEstimado) * p.cantidadProducto) AS tiempoProduccionEstimado,
--  prod.tiempoProduccionEstimado,  -- tiempo estimado del producto
    t.tiempoProduccion              -- tiempo real del trabajo
FROM trabajos t
JOIN empleados e ON t.idEmpleado = e.idEmpleado
JOIN procesos p ON t.idProceso = p.idProceso
LEFT JOIN incidencias i ON i.idProceso = p.idProceso
LEFT JOIN productos prod ON p.idProducto = prod.idProducto  -- JOIN con productos
GROUP BY
    e.apellidoEmpleado,
    e.nombreEmpleado,
    p.nombreProceso,
    p.fechaInicio,
    p.fechaFin,
    p.idProceso,
    prod.tiempoProduccionEstimado,
    p.cantidadProducto,  -- Agregar para consistencia en el GROUP BY
    t.tiempoProduccion
ORDER BY
    e.apellidoEmpleado,
    e.nombreEmpleado;


