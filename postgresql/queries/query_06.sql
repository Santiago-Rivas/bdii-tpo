SELECT
    nro_cliente,
    COUNT(nro_factura)
FROM
    E01_CLIENTE NATURAL
    JOIN E01_FACTURA
GROUP BY
    nro_cliente;