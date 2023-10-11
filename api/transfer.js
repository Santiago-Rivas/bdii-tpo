const pgp = require('pg-promise')();
const fs = require('fs');
const path = require('path'); // For working with file paths
const readline = require('readline');
const { MongoClient } = require('mongodb');

// PostgreSQL database connection details
const dbConfig = {
    user: 'santiago',
    password: '',
    host: 'localhost',
    port: 5432,
    database: 'bdii_tpo',
};

// Create a PostgreSQL database connection
const db = pgp(dbConfig);

// MongoDB connection URL
const mongoURL = 'mongodb://localhost:27017';
const dbName = 'bdii_tpo'; // Change to your MongoDB database name

// List of tables you want to export data from
const tablesToExport = ['e01_cliente',
    //'e01_detalle_factura',
    'e01_factura',
    'e01_producto',
    'e01_telefono'];

// // output dir
// const outputDir = './tsv_output';
// 
// // Create the output directory if it doesn't exist
// if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true }); // recursive: true will create parent directories if needed
// }

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

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the database connection

        // const mongodb = client.db(dbName);
        // await mongodb.collection('e01_detalle_factura').drop();

        pgp.end();
        client.close();

    }
})();



















/*
 *
async function associateDetalleFacturasWithFacturas(client) {
    const mongodb = client.db(dbName);

    await mongodb.collection('e01_factura').aggregate([
      {
        $lookup: {
          from: "e01_detalle_factura",
          localField: "nro_factura",
          foreignField: "nro_factura",
          as: "detalle_facturas"
        }
      },
      {
        $addFields: {
          detalle_facturas: {
            $map: {
              input: "$detalle_facturas",
              as: "detalle",
              in: {
                codigo_producto: "$$detalle.codigo_producto",
                nro_item: "$$detalle.nro_item",
                cantidad: "$$detalle.cantidad"
              }
            }
          }
        }
      }
    ]).forEach(function(factura) {
      mongodb.collection('e01_factura').updateOne(
        { _id: factura._id },
        {
          $set: {
            detalle_facturas: factura.detalle_facturas
          }
        }
      );
    });

    console.log('Associated detalle_facturas with facturas.');
}
 * */
