SELECT
    E01_FACTURA.nro_cliente,
    COUNT(nro_factura)
FROM
    E01_CLIENTE RIGHT
    JOIN E01_FACTURA
    ON E01_CLIENTE.nro_cliente = E01_FACTURA.nro_cliente
GROUP BY
    E01_FACTURA.nro_cliente;
