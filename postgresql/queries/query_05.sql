SELECT
    E01_CLIENTE.NRO_CLIENTE,
    E01_CLIENTE.NOMBRE,
    E01_CLIENTE.APELLIDO,
    E01_CLIENTE.DIRECCION,
    E01_CLIENTE.ACTIVO,
    E01_TELEFONO.NRO_TELEFONO
FROM
    E01_CLIENTE NATURAL
    JOIN E01_TELEFONO;