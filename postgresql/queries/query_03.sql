-- 3. Seleccionar todos los clientes que no tengan registrada una factura.

SELECT * FROM E01_CLIENTE
WHERE NRO_CLIENTE NOT IN (SELECT DISTINCT NRO_CLIENTE FROM E01_FACTURA);

