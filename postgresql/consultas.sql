-- Trabajo Practico Obligatorio Bases de Datos II

-- Consultas SQL Requeridas

-- 1. Obtener el teléfono y el número de cliente del cliente con nombre “Wanda” y apellido “Baker”.

SELECT
    E01_TELEFONO.NRO_TELEFONO,
    E01_CLIENTE.NRO_CLIENTE
FROM E01_CLIENTE
NATURAL JOIN E01_TELEFONO
WHERE
    E01_CLIENTE.NOMBRE = 'Wanda'
    AND E01_CLIENTE.APELLIDO = 'Baker';


-- 2. Seleccionar todos los clientes que tengan registrada al menos una factura.

SELECT * FROM E01_CLIENTE WHERE NRO_CLIENTE IN (SELECT DISTINCT NRO_CLIENTE FROM E01_FACTURA);


-- 3. Seleccionar todos los clientes que no tengan registrada una factura.

SELECT * FROM E01_CLIENTE
WHERE NRO_CLIENTE NOT IN (SELECT DISTINCT NRO_CLIENTE FROM E01_FACTURA);


-- 4. Seleccionar los productos que han sido facturados al menos 1 vez.

SELECT * FROM E01_PRODUCTO WHERE codigo_producto IN (SELECT DISTINCT codigo_producto FROM E01_DETALLE_FACTURA);


-- 5. Seleccionar los datos de los clientes junto con sus teléfonos.

SELECT
    E01_CLIENTE.NRO_CLIENTE,
    E01_CLIENTE.NOMBRE,
    E01_CLIENTE.APELLIDO,
    E01_CLIENTE.DIRECCION,
    E01_CLIENTE.ACTIVO,
    E01_TELEFONO.NRO_TELEFONO
FROM E01_CLIENTE
NATURAL JOIN E01_TELEFONO;


-- 6. Devolver todos los clientes,
-- con la cantidad de facturas que tienen registradas
-- (admitir nulos en valores de Clientes).

SELECT nro_cliente, COUNT(nro_factura) FROM E01_CLIENTE c LEFT JOIN E01_FACTURA f ON e.nro_cliente = f.nro_cliente GROUP BY nro_cliente;

-- 7. Listar todas las Facturas que hayan sido compradas por
-- el cliente de nombre "Pandora" y apellido "Tate".

SELECT * FROM E01_FACTURA
WHERE NRO_CLIENTE IN (
    SELECT NRO_CLIENTE FROM E01_CLIENTE
    WHERE NOMBRE = 'Pandora' AND APELLIDO = 'Tate'
);


-- 8. Listar todas las Facturas que contengan productos
-- de la marca “In Faucibus Inc.”

SELECT * FROM E01_FACTURA
WHERE nro_factura IN (
    SELECT DISTINCT nro_factura FROM E01_DETALLE_FACTURA NATURAL JOIN e01_producto
    WHERE marca = 'In Faucibus Inc.'
);

-- 9. Mostrar cada teléfono junto con los datos del cliente.
SELECT
    E01_TELEFONO.NRO_TELEFONO,
    E01_CLIENTE.NRO_CLIENTE,
    E01_CLIENTE.NOMBRE,
    E01_CLIENTE.APELLIDO,
    E01_CLIENTE.DIRECCION,
    E01_CLIENTE.ACTIVO
FROM E01_CLIENTE
NATURAL JOIN E01_TELEFONO;

-- 10. Mostrar nombre y apellido de cada cliente junto con lo que gastó en total (con IVA incluido).
SELECT nombre, apellido, SUM(total_con_iva) FROM E01_CLIENTE NATURAL JOIN E01_FACTURA GROUP BY nombre, apellido;
-- Hay algunos que suman cero. Signfica que hay facturas sin detalle, eso esta bien???
