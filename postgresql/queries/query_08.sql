SELECT
    *
FROM
    E01_FACTURA
WHERE
    nro_factura IN (
        SELECT
            DISTINCT nro_factura
        FROM
            E01_DETALLE_FACTURA NATURAL
            JOIN e01_producto
        WHERE
            marca = 'In Faucibus Inc.'
    );