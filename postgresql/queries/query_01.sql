-- 1. Obtener el teléfono y el número de cliente del cliente con nombre “Wanda” y apellido “Baker”.

SELECT
    E01_TELEFONO.NRO_TELEFONO,
    E01_CLIENTE.NRO_CLIENTE
FROM E01_CLIENTE
NATURAL JOIN E01_TELEFONO
WHERE
    E01_CLIENTE.NOMBRE = 'Wanda'
    AND E01_CLIENTE.APELLIDO = 'Baker';

