SELECT
    *
FROM
    E01_FACTURA
WHERE
    NRO_CLIENTE IN (
        SELECT
            NRO_CLIENTE
        FROM
            E01_CLIENTE
        WHERE
            NOMBRE = 'Pandora'
            AND APELLIDO = 'Tate'
    );