-- Trabajo Practico Obligatorio Bases de Datos II

-- Vistas

-- 1. Se debe realizar una vista que devuelva las facturas ordenadas por fecha.

DROP VIEW IF EXISTS facturas_por_fecha;

CREATE VIEW facturas_por_fecha AS
SELECT * FROM E01_FACTURA ORDER BY fecha;

SELECT * FROM facturas_por_fecha;


-- 2. Se necesita una vista que de devuelva todos los productos que aún no han sido facturados.
DROP VIEW IF EXISTS productos_no_facturados;

CREATE VIEW productos_no_facturados AS
SELECT * FROM E01_PRODUCTO WHERE codigo_producto NOT IN (
    SELECT codigo_producto FROM E01_DETALLE_FACTURA
);

SELECT * FROM productos_no_facturados;