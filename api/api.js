const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

const dbConfig = {
    user: 'santiago',
    password: '',
    host: 'localhost',
    port: 5432,
    database: 'bdii_tpo',
};

// PostgreSQL configuration
const pgp = require('pg-promise')();
const db = pgp(dbConfig);

// Function to run the SQL script
async function runInitScript() {
    try {
        // Read and execute the SQL script
        const fs = require('fs');
        const sqlScript = fs.readFileSync('../postgresql/api.sql', 'utf8');
        await db.none(sqlScript); // Use db.none to execute the script without expecting a result

        console.log('SQL script executed successfully');
    } catch (error) {
        console.error('Error executing SQL script:', error);
    }
}

runInitScript()
    .then(() => {
        // Define API routes and handlers here

        // Get all clients
        app.get('/clients', async (req, res) => {
            try {
                const data = await db.any('SELECT * FROM e01_cliente');
                res.json(data);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'An error occurred.' });
            }
        });

        // Get all products
        app.get('/products', async (req, res) => {
            try {
                const data = await db.any('SELECT * FROM e01_producto');
                res.json(data);
            } catch (error) {
                console.error(error);
                res.status(500).json({ error: 'An error occurred.' });
            }
        });

        // Define a POST route to insert a new cliente
        app.post('/clients/insert', async (req, res) => {
            try {
                const { p_nro_cliente, p_nombre, p_apellido, p_direccion, p_activo } = req.body;

                // Execute the PostgreSQL function with the provided parameters
                const result = await db.one('SELECT InsertCliente($1::INTEGER, $2::VARCHAR(45), $3::VARCHAR(45), $4::VARCHAR(45), $5::SMALLINT)', [
                    p_nro_cliente,
                    p_nombre,
                    p_apellido,
                    p_direccion,
                    p_activo,
                ]);

                res.status(201).json({ message: 'Cliente inserted successfully' });
            } catch (error) {
                console.log(res);
                console.error(error);
                res.status(500).json({ error: 'An error occurred while inserting the client' });
            }
        });

        // Define a POST route to update a client
        app.post('/clients/update', async (req, res) => {
            try {
                const { p_nro_cliente, p_nombre, p_apellido, p_direccion, p_activo } = req.body;

                // Execute the PostgreSQL function with the provided parameters
                const result = await db.one('SELECT UpdateCliente($1::INTEGER, $2::VARCHAR(45), $3::VARCHAR(45), $4::VARCHAR(45), $5::SMALLINT)', [
                    p_nro_cliente,
                    p_nombre,
                    p_apellido,
                    p_direccion,
                    p_activo,
                ]);

                res.status(201).json({ message: 'Cliente updated successfully' });
            } catch (error) {
                console.log(res);
                console.error(error);
                res.status(500).json({ error: 'An error occurred while updating the client' });
            }
        });

        // Define a POST route to delete a client
        app.post('/clients/delete', async (req, res) => {
            try {
                const { p_nro_cliente } = req.body;

                // Execute the PostgreSQL function with the provided parameters
                const result = await db.one('SELECT DeleteCliente($1::INTEGER)', [
                    p_nro_cliente
                ]);

                res.status(201).json({ message: 'Cliente deleted successfully' });
            } catch (error) {
                console.log(res);
                console.error(error);
                res.status(500).json({ error: 'An error occurred while deleting the client' });
            }
        });

        // Define a POST route to insert a new product
        app.post('/products/insert', async (req, res) => {
            try {
                const { p_codigo_producto, p_marca, p_nombre, p_descripcion, p_precio, p_stock } = req.body;

                // Execute the PostgreSQL function with the provided parameters
                const result = await db.one('SELECT InsertProducto($1::INTEGER, $2::VARCHAR(45), $3::VARCHAR(45), $4::VARCHAR(45), $5::FLOAT, $6::INTEGER)', [
                    p_codigo_producto,
                    p_marca,
                    p_nombre,
                    p_descripcion,
                    p_precio,
                    p_stock
                ]);

                res.status(201).json({ message: 'Product inserted successfully' });
            } catch (error) {
                console.log(res);
                console.error(error);
                res.status(500).json({ error: 'An error occurred while updating the product' });
            }
        });

        // Define a POST route to update a product
        app.post('/products/update', async (req, res) => {
            try {
                const { p_codigo_producto, p_marca, p_nombre, p_descripcion, p_precio, p_stock } = req.body;

                // Execute the PostgreSQL function with the provided parameters
                const result = await db.one('SELECT UpdateProducto($1::INTEGER, $2::VARCHAR(45), $3::VARCHAR(45), $4::VARCHAR(45), $5::FLOAT, $6::INTEGER)', [
                    p_codigo_producto,
                    p_marca,
                    p_nombre,
                    p_descripcion,
                    p_precio,
                    p_stock
                ]);

                res.status(201).json({ message: 'Product updated successfully' });
            } catch (error) {
                console.log(res);
                console.error(error);
                res.status(500).json({ error: 'An error occurred while deleting the product' });
            }
        });

        // Define a POST route to delete a product
        app.post('/products/update', async (req, res) => {
            try {
                const { p_codigo_producto } = req.body;

                // Execute the PostgreSQL function with the provided parameters
                const result = await db.one('SELECT DeleteCliente($1::INTEGER)' [
                    p_codigo_producto
                ]);

                res.status(201).json({ message: 'Product deleted successfully' });
            } catch (error) {
                console.log(res);
                console.error(error);
                res.status(500).json({ error: 'An error occurred while updating the product' });
            }
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    });
