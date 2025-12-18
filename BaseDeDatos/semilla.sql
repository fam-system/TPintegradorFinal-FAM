use BaseFinal;

INSERT INTO roles (nombreRol) VALUES 
('administrador'),
('encargado'),
('oficina'),
('operario');

INSERT INTO empleados (nombreEmpleado, apellidoEmpleado, dniEmpleado, direccionEmpleado, telefonoEmpleado, fechaIngreso)
VALUES
('Juan', 'Pérez', '30123456', 'Calle Falsa 123', '3411234567', '2023-03-01'),
('Ana', 'Gómez', '30234567', 'Av. Siempreviva 742', '3412345678', '2023-06-15'),
('Carlos', 'López', '30345678', 'Ruta 9 Km 13', '3413456789', '2024-01-10'),
('Lucía', 'Martínez', '30456789', 'Belgrano 1010', '3414567890', '2024-02-20');

INSERT INTO usuarios (idEmpleado, nombreUsuario, pass, idRol) VALUES
(1, 'admin', '$2a$12$cJTgd5kgjSaxTIRxkoE1j.1IbHscJCYbFPiz.8f7Qr8I9Bg/JTA6m', 1), -- admin123
(2, 'encargado1', '$2a$12$0hqoZrvlw/ptt4szqio2SO7HGWEcWVyW.whYV26TtZmvVTYeBDDYe', 2), -- enc123
(3, 'oficina1', '$2a$12$5MRbijldDbXf.vqFzoTuXODa7ZN89bj6djZvNW728DtP1S3iWWml2' , 3), -- ofi123
(4, 'operario1', '$2a$12$FpW.lqTs5MllUW8yI8dDeeULEwhlLwLQlA.Fm1k7Sh/lEJNx7./XO' , 4); -- ope123

INSERT INTO tiposIncidencias (tipoIncidencia) VALUES
('Mecánica'),
('Eléctrica'),
('Logística'),
('Otros');