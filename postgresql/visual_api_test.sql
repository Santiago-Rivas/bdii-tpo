SELECT InsertCliente(
    100001,
    'Santiago'::VARCHAR(45),
    'Rivas'::VARCHAR(45),
    'Venado 9'::VARCHAR(45),
    1::INT2
);

SELECT InsertCliente(
    100002,
    'Santiago'::VARCHAR(45),
    'Rivas'::VARCHAR(45),
    'Venado 9'::VARCHAR(45),
    1::INT2
);

SELECT * FROM E01_CLIENTE WHERE nro_cliente IN (
    100001,
    100002
);

SELECT UpdateCliente(100002, 'Luis', NULL, 'New Castle'::VARCHAR(45), 2::INT2);

SELECT * FROM E01_CLIENTE WHERE nro_cliente IN (
    100001,
    100002
);

SELECT DeleteCliente(100001);
SELECT DeleteCliente(100002);

SELECT InsertProducto(
    100001,
    'Havana'::VARCHAR(45),
    'Alafajores'::VARCHAR(45),
    'Alfajores de chocolate HAVANA'::VARCHAR(45),
    100::FLOAT,
    2000
);


SELECT InsertProducto(
    100002,
    'Cachafaz'::VARCHAR(45),
    'Alafajores'::VARCHAR(45),
    'Alfajores de chocolate Cachafaz'::VARCHAR(45),
    150::FLOAT,
    1000
);

SELECT * FROM E01_PRODUCTO WHERE codigo_producto IN (
    100001,
    100002
);

SELECT UpdateProducto(100002, NULL, NULL, 'Alfajores de dulce de leche de Cachafaz'::VARCHAR(45), NULL, NULL);

SELECT * FROM E01_PRODUCTO WHERE codigo_producto IN (
    100001,
    100002
);

SELECT DeleteProducto(100001);
SELECT DeleteProducto(100002);

