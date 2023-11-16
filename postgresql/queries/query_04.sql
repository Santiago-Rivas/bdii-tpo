SELECT
    *
FROM
    E01_PRODUCTO
WHERE
    codigo_producto IN (
        SELECT
            DISTINCT codigo_producto
        FROM
            E01_DETALLE_FACTURA
    );