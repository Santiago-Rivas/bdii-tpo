-- 8. Listar todas las Facturas que contengan productos
-- de la marca “In Faucibus Inc.”

SELECT * FROM E01_FACTURA
WHERE nro_factura IN (
    SELECT DISTINCT nro_factura FROM E01_DETALLE_FACTURA NATURAL JOIN e01_producto
    WHERE marca = 'In Faucibus Inc.'
);
-- Esta bien el DISTINCT??? Porque podria haber un detalle factura con dos productos diferentes pero de la misma marca

