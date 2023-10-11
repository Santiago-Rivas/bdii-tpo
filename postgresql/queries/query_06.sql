-- 6. Devolver todos los clientes,
-- con la cantidad de facturas que tienen registradas
-- (admitir nulos en valores de Clientes).

SELECT nro_cliente, COUNT(nro_factura) FROM E01_CLIENTE NATURAL JOIN E01_FACTURA GROUP BY nro_cliente;
-- No entiendo que seria que admite nulos???

