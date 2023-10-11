-- 4. Seleccionar los productos que han sido facturados al menos 1 vez.

SELECT * FROM E01_PRODUCTO WHERE codigo_producto IN (SELECT DISTINCT codigo_producto FROM E01_DETALLE_FACTURA);

