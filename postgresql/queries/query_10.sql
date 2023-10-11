-- 10. Mostrar nombre y apellido de cada cliente junto con lo que gastó en total (con IVA incluido).
SELECT nombre, apellido, SUM(total_con_iva) FROM E01_CLIENTE NATURAL JOIN E01_FACTURA GROUP BY nombre, apellido;
-- Hay algunos que suman cero. Signfica que hay facturas sin detalle, eso esta bien???

