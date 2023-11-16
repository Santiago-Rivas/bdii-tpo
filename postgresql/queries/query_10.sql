SELECT
    nombre,
    apellido,
    SUM(total_con_iva)
FROM
    E01_CLIENTE NATURAL
    JOIN E01_FACTURA
GROUP BY
    nombre,
    apellido;