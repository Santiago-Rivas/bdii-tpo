const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path'); // For working with file paths
const readline = require('readline');
const { MongoClient } = require('mongodb');

// Access the configuration variables
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
};

// Create a PostgreSQL database connection
const db = pgp(dbConfig);

// MongoDB connection URL
const mongoURL = process.env.MONGO_URL;
const dbName = process.env.DB_DATABASE;

// List of tables you want to export data from
const tablesToExport = ['e01_cliente',
    'e01_factura',
    'e01_producto',
    'e01_telefono'];

async function insertDataIntoMongoDB(dataArray, client, collectionName, columns) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const data = dataArray.split('\n').map((line) => {
            const values = line.split('\t');
            const obj = {};
            for (let i = 0; i < values.length; i++) {
                // Check if the value should be treated as a number and convert it if necessary
                if (isNumeric(values[i])) {
                    obj[columns[i]] = parseFloat(values[i]);
                } else {
                    obj[columns[i]] = values[i];
                }
            }
            return obj;
        });

        const result = await collection.insertMany(data);
        console.log(`${result.insertedCount} documents inserted into MongoDB for collection ${collectionName}`);
    } catch (error) {
        console.error('Error inserting data into MongoDB:', error);
    }
}

// Function to check if a value is numeric
function isNumeric(value) {
    return !isNaN(value) && isFinite(value);
}

async function dropCollections(client) {
    const db = client.db(dbName);

    for (const table of tablesToExport) {
        if (await db.listCollections({ name: table }).hasNext()) {
            await db.collection(table).drop();
            console.log(`Collection ${table} dropped.`);
        }
    }
}


async function insertDetalleFacturasIntoFacturas(detalleFacturas, client) {
    const db = client.db(dbName);
    const facturaCollection = db.collection('e01_factura');

    try {
        for (const detalleFactura of detalleFacturas) {
            const nroFactura = detalleFactura.nro_factura;

            const detalleData = {
                codigo_producto: detalleFactura.codigo_producto,
                nro_item: detalleFactura.nro_item,
                cantidad: detalleFactura.cantidad,
            };
            // Find the factura document with matching nro_factura
            const facturaDocument = await facturaCollection.findOne({ nro_factura: nroFactura });

            if (facturaDocument) {
                // Check if the 'detalle_facturas' field exists, and if not, create it as an array
                if (!facturaDocument.detalle_facturas) {
                    facturaDocument.detalle_facturas = [];
                }

                // Push the detalleData into the 'detalle_facturas' array
                facturaDocument.detalle_facturas.push(detalleData);

                // Update the factura document with the new 'detalle_facturas' array
                await facturaCollection.updateOne(
                    { nro_factura: nroFactura },
                    {
                        $set: {
                            detalle_facturas: facturaDocument.detalle_facturas,
                        },
                    }
                );
            } else {
                console.error(`No matching factura found for nro_factura ${nroFactura}`);
            }
        }

        console.log(`${detalleFacturas.length} detalle_facturas inserted into factura documents`);
    } catch (error) {
        console.error('Error inserting detalle_facturas into factura documents:', error);
    }
}

async function fetchDetalleFacturasFromDatabase() {
    try {
        const data = await db.any('SELECT * FROM e01_detalle_factura');
        return data;
    } catch (error) {
        console.error('Error fetching e01_detalle_factura data:', error);
        return [];
    }
}

const createUniqueIndex = async (mongoClient, collectionName, fieldNames) => {
    try {
        // Connect to the MongoDB database
        await mongoClient.connect();

        // Select the MongoDB database and collection
        const mongoDb = mongoClient.db(dbName);
        const collection = mongoDb.collection(collectionName);

        // Create a unique index on the specified fields (a compound unique index)
        const index = {};
        for (const fieldName of fieldNames) {
            index[fieldName] = 1;
        }
        await collection.createIndex(index, { unique: true });

        console.log(`Unique index created for ${collectionName}.${fieldNames.join(', ')}`);

        // Close the MongoDB connection
        mongoClient.close();
    } catch (error) {
        console.error(`Error creating unique index for ${collectionName}.${fieldNames.join(', ')}: ${error}`);
    }
};

(async () => {
    let client;

    client = new MongoClient(mongoURL);
    await client.connect();

    // Drop collections if they exist
    await dropCollections(client);
    try {

        for (const table of tablesToExport) {
            // Fetch data and column names from the table
            const data = await db.any(`SELECT * FROM ${table}`);
            const columns = Object.keys(data[0]);

            // Create an array to store rows including the header row
            // const rows = [columns.join('\t')];
            const rows = [];

            // Add data rows to the array
            data.forEach((row) => {
                rows.push(columns.map((column) => row[column]).join('\t'));
            });

            // Convert data to TSV format
            const tsvData = rows.join('\n');

            await insertDataIntoMongoDB(tsvData, client, table, columns);
        }

        // Fetch e01_detalle_factura data from the database
        const detalleFacturaData = await fetchDetalleFacturasFromDatabase();

        // Insert e01_detalle_factura data into e01_factura
        await insertDetalleFacturasIntoFacturas(detalleFacturaData, client);

        // Create unique indexes for the specified fields
        await createUniqueIndex(client, 'e01_cliente', ['nro_cliente']);
        await createUniqueIndex(client, 'e01_factura', ['nro_factura']);
        await createUniqueIndex(client, 'e01_producto',[ 'codigo_producto']);
        await createUniqueIndex(client, 'e01_telefono',[ 'codigo_area',  'nro_telefono']);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        pgp.end();
        client.close();

    }
})();
