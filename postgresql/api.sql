-- Trabajo Practico Obligatorio Bases de Datos II

-- 1. Dar de alta a nuevos clientes, baja y modificación de los ya existentes.

CREATE OR REPLACE FUNCTION InsertCliente(
    p_nro_cliente INTEGER,
    p_nombre VARCHAR(45),
    p_apellido VARCHAR(45),
    p_direccion VARCHAR(45),
    p_activo SMALLINT
)
RETURNS VOID
AS $$
BEGIN
    INSERT INTO E01_CLIENTE (nro_cliente, nombre, apellido, direccion, activo)
    VALUES (p_nro_cliente, p_nombre, p_apellido, p_direccion, p_activo);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION DeleteCliente(
    p_nro_cliente INTEGER
)
RETURNS VOID
AS $$
BEGIN
    DELETE FROM E01_CLIENTE WHERE nro_cliente = p_nro_cliente;
END;
$$ LANGUAGE plpgsql;


-- Funcion para modificar cada entrada en la tabla.
-- Si uno de los elementos no se queirer modificar se envia null

CREATE OR REPLACE FUNCTION UpdateCliente(
    p_nro_cliente INTEGER,
    p_nombre VARCHAR(45),
    p_apellido VARCHAR(45),
    p_direccion VARCHAR(45),
    p_activo SMALLINT
)
RETURNS VOID
AS $$
BEGIN
    UPDATE E01_CLIENTE
    SET
        nombre = COALESCE(p_nombre, nombre),
        apellido = COALESCE(p_apellido, apellido),
        direccion = COALESCE(p_direccion, direccion),
        activo = COALESCE(p_activo, activo)
    WHERE nro_cliente = p_nro_cliente;
END;
$$ LANGUAGE plpgsql;


-- 2. Dar de alta a nuevos productos y modificación de los ya existentes.
-- Tenga en cuenta que el lrecio de un producto es sin IVA.

CREATE OR REPLACE FUNCTION InsertProducto(
    p_codigo_producto INTEGER,
    p_marca VARCHAR(45),
    p_nombre VARCHAR(45),
    p_descripcion VARCHAR(45),
    p_precio FLOAT,
    p_stock INTEGER
)
RETURNS VOID
AS $$
BEGIN
    INSERT INTO E01_PRODUCTO (codigo_producto, marca, nombre, descripcion, precio, stock)
    VALUES (p_codigo_producto, p_marca, p_nombre, p_descripcion, p_precio, p_stock);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION DeleteProducto(
    p_codigo_producto INTEGER
)
RETURNS VOID
AS $$
BEGIN
    DELETE FROM E01_PRODUCTO WHERE codigo_producto = p_codigo_producto;
END;
$$ LANGUAGE plpgsql;


-- Funcion para modificar cada entrada en la tabla.
-- Si uno de los elementos no se queirer modificar se envia null

CREATE OR REPLACE FUNCTION UpdateProducto(
    p_codigo_producto INTEGER,
    p_marca VARCHAR(45),
    p_nombre VARCHAR(45),
    p_descripcion VARCHAR(45),
    p_precio FLOAT,
    p_stock INTEGER
)
RETURNS VOID
AS $$
BEGIN
    UPDATE E01_PRODUCTO
    SET
        marca = COALESCE(p_marca, marca),
        nombre = COALESCE(p_nombre, nombre),
        descripcion = COALESCE(p_descripcion, descripcion),
        precio = COALESCE(p_precio, precio),
        stock = COALESCE(p_stock, stock)
    WHERE codigo_producto = p_codigo_producto;
END;
$$ LANGUAGE plpgsql;


