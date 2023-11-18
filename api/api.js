const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const fs = require('fs');
const { spawn } = require('child_process');
const dotenv = require('dotenv');
dotenv.config(); // This loads the environment variables from the .env file

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());

// Access the configuration variables
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
};

// PostgreSQL configuration
const pgp = require('pg-promise')();
const db = pgp(dbConfig);

const initSqlScriptPath = process.env.POSTGRESQL_INIT_SCRIPT;

// MongoDB configuration
const mongoUrl = process.env.MONGO_URL;
const mongoClient = new MongoClient(mongoUrl);

// Define API routes and handlers here
app.get('/postgresql/init-db', async (req, res) => {
    try {
        const scriptFilePath = initSqlScriptPath; // Provide the path to your SQL script file

        // Read the SQL script from the file
        const sqlScript = fs.readFileSync(scriptFilePath, 'utf8');

        const client = await db.connect();

        // Execute the SQL script
        await client.query(sqlScript);

        res.status(200).json({ message: 'Database initialized successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while initializing the database' });
    }
});

// Define a route to drop all tables
app.get('/postgresql/drop-tables', async (req, res) => {
    try {
        // Drop the 'public' schema and recreate it
        await db.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

        res.status(200).json({ message: 'All tables dropped successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while dropping tables' });
    }
});

app.get('/psql-to-mongo', (req, res) => {
    try {
        // Replace 'node' with the path to your Node.js executable, if necessary
        const scriptProcess = spawn('node', [process.env.TRANSFER_FILE]);

        scriptProcess.stdout.on('data', (data) => {
            console.log(`Script output: ${data}`);
        });

        scriptProcess.stderr.on('data', (data) => {
            console.error(`Script error: ${data}`);
        });

        scriptProcess.on('close', (code) => {
            console.log(`Script exited with code ${code}`);
            res.status(200).json({ message: 'Transfer executed successfully' });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while running the script' });
    }
});

// Get all clients
app.get('/postgresql/clients', async (req, res) => {
    try {
        const data = await db.any('SELECT * FROM e01_cliente');
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});

// Get all products
app.get('/postgresql/products', async (req, res) => {
    try {
        const data = await db.any('SELECT * FROM e01_producto');
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});

// Define a POST route to insert a new cliente
app.post('/postgresql/clients/insert', async (req, res) => {
    try {
        const { p_nro_cliente, p_nombre, p_apellido, p_direccion, p_activo } = req.body;
        const insertQuery = `
INSERT INTO e01_cliente(nro_cliente, nombre, apellido, direccion, activo)
VALUES($1, $2, $3, $4, $5)
`;

        // Execute the PostgreSQL function with the provided parameters
        const result = await db.none(insertQuery , [
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
app.post('/postgresql/clients/update', async (req, res) => {
    try {
        const { p_nro_cliente, p_nombre, p_apellido, p_direccion, p_activo } = req.body;
        // Create an UPDATE statement for the 'e01_cliente' table
        const updateQuery = `
UPDATE e01_cliente
SET nombre = $2, apellido = $3, direccion = $4, activo = $5
WHERE nro_cliente = $1
`;
        // Execute the PostgreSQL function with the provided parameters
        const result = await db.none(updateQuery, [
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
app.post('/postgresql/clients/delete', async (req, res) => {
    try {
        const { p_nro_cliente } = req.body;

        // Create a DELETE statement for the 'e01_cliente' table
        const deleteQuery = `
DELETE FROM e01_cliente
WHERE nro_cliente = $1
`;

        // Execute the PostgreSQL function with the provided parameters
        const result = await db.none(deleteQuery, [
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
app.post('/postgresql/products/insert', async (req, res) => {
    try {
        const { p_codigo_producto, p_marca, p_nombre, p_descripcion, p_precio, p_stock } = req.body;

        // Create an INSERT statement for the 'e01_producto' table
        const insertQuery = `
INSERT INTO e01_producto(codigo_producto, marca, nombre, descripcion, precio, stock)
VALUES($1, $2, $3, $4, $5, $6)
`;
        // Execute the PostgreSQL function with the provided parameters
        const result = await db.none(insertQuery, [
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
app.post('/postgresql/products/update', async (req, res) => {
    try {
        const { p_codigo_producto, p_marca, p_nombre, p_descripcion, p_precio, p_stock } = req.body;


        // Create an UPDATE statement for the 'e01_producto' table
        const updateQuery = `
UPDATE e01_producto
SET marca = $2, nombre = $3, descripcion = $4, precio = $5, stock = $6
WHERE codigo_producto = $1
`;

        // Execute the PostgreSQL function with the provided parameters
        const result = await db.none(updateQuery, [
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
app.post('/postgresql/products/delete', async (req, res) => {
    try {
        const { p_codigo_producto } = req.body;

        // Create a DELETE statement for the 'e01_producto' table
        const deleteQuery = `
DELETE FROM e01_producto
WHERE codigo_producto = $1
`;

        // Execute the PostgreSQL function with the provided parameters
        const result = await db.none(deleteQuery, [
            p_codigo_producto
        ]);

        res.status(201).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.log(res);
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the product' });
    }
});

// Get all clients from MongoDB
app.get('/mongodb/clients', async (req, res) => {
    try {
        const mongoDb = mongoClient.db(dbConfig.database);
        const clientsCollection = mongoDb.collection('e01_cliente');
        const data = await clientsCollection.find({}).toArray();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});

// Get all products from MongoDB
app.get('/mongodb/products', async (req, res) => {
    try {
        const mongoDb = mongoClient.db(dbConfig.database);
        const clientsCollection = mongoDb.collection('e01_producto');
        const data = await clientsCollection.find({}).toArray();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred.' });
    }
});


// Define a POST route to insert a client into MongoDB
app.post('/mongodb/clients/insert', async (req, res) => {
    try {
        const { p_nro_cliente, p_nombre, p_apellido, p_direccion, p_activo } = req.body;

        // Connect to the MongoDB database
        await mongoClient.connect();

        // Select the MongoDB database and collection
        const mongoDb = mongoClient.db(dbConfig.database);
        const clientsCollection = mongoDb.collection('e01_cliente');

        // Create a new client document
        const newClient = {
            nro_cliente: p_nro_cliente,
            nombre: p_nombre,
            apellido: p_apellido,
            direccion: p_direccion,
            activo: p_activo,
        };

        // Insert the client document into the MongoDB collection
        const result = await clientsCollection.insertOne(newClient);

        console.log(result);
        // Close the MongoDB connection
        mongoClient.close();

        res.status(201).json({ message: 'Client inserted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while inserting the client into MongoDB' });
    }
});

// Define a POST route to update a client in MongoDB
app.post('/mongodb/clients/update', async (req, res) => {
    try {
        const { p_nro_cliente, p_nombre, p_apellido, p_direccion, p_activo } = req.body;

        // Connect to the MongoDB database
        await mongoClient.connect();

        // Select the MongoDB database and collection
        const mongoDb = mongoClient.db(dbConfig.database);
        const clientsCollection = mongoDb.collection('e01_cliente');

        // Create a filter to identify the client you want to update
        const filter = { nro_cliente: p_nro_cliente };

        // Define the update data
        const updateData = {
            $set: {
                nombre: p_nombre,
                apellido: p_apellido,
                direccion: p_direccion,
                activo: p_activo,
            },
        };

        // Update the client document in the MongoDB collection
        const result = await clientsCollection.updateOne(filter, updateData);

        console.log(result);
        // Close the MongoDB connection
        mongoClient.close();

        res.status(200).json({ message: 'Client updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the client in MongoDB' });
    }
});


// Define a POST route to delete a client from MongoDB
app.post('/mongodb/clients/delete', async (req, res) => {
    try {
        const { p_nro_cliente } = req.body;

        // Connect to the MongoDB database
        await mongoClient.connect();

        // Select the MongoDB database and collection
        const mongoDb = mongoClient.db(dbConfig.database);
        const clientsCollection = mongoDb.collection('e01_cliente');

        // Create a filter to identify the client you want to delete
        const filter = { nro_cliente: p_nro_cliente };

        // Delete the client document from the MongoDB collection
        const result = await clientsCollection.deleteOne(filter);

        console.log(result);
        // Close the MongoDB connection
        mongoClient.close();

        res.status(200).json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the client from MongoDB' });
    }
});


// Define a POST route to insert a product into MongoDB
app.post('/mongodb/products/insert', async (req, res) => {
    try {
        const { p_codigo_producto, p_marca, p_nombre, p_descripcion, p_precio, p_stock } = req.body;

        // Connect to the MongoDB database
        await mongoClient.connect();

        // Select the MongoDB database and collection for products
        const mongoDb = mongoClient.db(dbConfig.database);
        const productsCollection = mongoDb.collection('e01_producto');

        // Create a new product document
        const newProduct = {
            codigo_producto: p_codigo_producto,
            marca: p_marca,
            nombre: p_nombre,
            descripcion: p_descripcion,
            precio: p_precio,
            stock: p_stock,
        };

        // Insert the product document into the MongoDB collection
        const result = await productsCollection.insertOne(newProduct);

        console.log(result);
        // Close the MongoDB connection
        mongoClient.close();

        res.status(201).json({ message: 'Product inserted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while inserting the product into MongoDB' });
    }
});


// Define a POST route to update a product in MongoDB
app.post('/mongodb/products/update', async (req, res) => {
    try {
        const { p_codigo_producto, p_marca, p_nombre, p_descripcion, p_precio, p_stock } = req.body;

        // Connect to the MongoDB database
        await mongoClient.connect();

        // Select the MongoDB database and collection for products
        const mongoDb = mongoClient.db(dbConfig.database);
        const productsCollection = mongoDb.collection('e01_producto');

        // Create a filter to identify the product you want to update
        const filter = { codigo_producto: p_codigo_producto };

        // Define the update data
        const updateData = {
            $set: {
                marca: p_marca,
                nombre: p_nombre,
                descripcion: p_descripcion,
                precio: p_precio,
                stock: p_stock,
            },
        };

        // Update the product document in the MongoDB collection
        const result = await productsCollection.updateOne(filter, updateData);

        console.log(result);
        // Close the MongoDB connection
        mongoClient.close();

        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating the product in MongoDB' });
    }
});


// Define a POST route to delete a product from MongoDB
app.post('/mongodb/products/delete', async (req, res) => {
    try {
        const { p_codigo_producto } = req.body;

        // Connect to the MongoDB database
        await mongoClient.connect();

        // Select the MongoDB database and collection for products
        const mongoDb = mongoClient.db(dbConfig.database);
        const productsCollection = mongoDb.collection('e01_producto');

        // Create a filter to identify the product you want to delete
        const filter = { codigo_producto: p_codigo_producto };

        // Delete the product document from the MongoDB collection
        const result = await productsCollection.deleteOne(filter);

        console.log(result);
        // Close the MongoDB connection
        mongoClient.close();

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while deleting the product from MongoDB' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
