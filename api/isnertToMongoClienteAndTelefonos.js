const fs = require('fs');
const readline = require('readline');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');

// MongoDB connection URL
const mongoURL = 'mongodb://localhost:27017';
const dbName = 'bdii_tpo'; // Change to your MongoDB database name
const clienteCollectionName = 'e01_cliente'; // Change to your MongoDB collection name for cliente data
const telefonoCollectionName = 'e01_telefono'; // Change to your MongoDB collection name for telefono data

// Specify the directory where TSV files are located
const tsvDir = './tsv_output'; // Change to the directory where your TSV files are

async function readTSVFile(filePath) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const dataArray = [];
  let header = null;

  for await (const line of rl) {
    const row = line.split('\t');
    if (!header) {
      // Assume the first row is the header
      header = row;
    } else {
      // Create an object using the header as keys and the current row as values
      const doc = {};
      header.forEach((key, index) => {
        doc[key] = row[index];
      });
      dataArray.push(doc);
    }
  }

  return dataArray;
}

async function insertClienteData(dataArray, client) {
  const db = client.db(dbName);
  const collection = db.collection(clienteCollectionName);

  try {
    await collection.insertMany(dataArray);

    console.log(`${dataArray.length} cliente documents inserted into MongoDB`);
  } catch (error) {
    console.error('Error inserting cliente data into MongoDB:', error);
  }
}

async function insertTelefonosIntoClientes(dataArray, client) {
  const db = client.db(dbName);
  const clienteCollection = db.collection(clienteCollectionName);

  try {
    for (const telefonoDoc of dataArray) {
      const nroCliente = telefonoDoc.nro_cliente;
      const telefonoData = {
        _id: new ObjectId(),
        codigo_area: telefonoDoc.codigo_area,
        nro_telefono: telefonoDoc.nro_telefono,
        tipo: telefonoDoc.tipo,
      };

      // Find the cliente document with matching nro_cliente and update it to add the telefono to the telefonos array
      await clienteCollection.updateOne(
        { nro_cliente: nroCliente },
        {
          $push: {
            telefonos: telefonoData,
          },
        }
      );
    }

    console.log(`${dataArray.length} telefonos inserted into cliente documents`);
  } catch (error) {
    console.error('Error inserting telefonos into cliente documents:', error);
  }
}

(async () => {
  let client;
  try {
    // Create a MongoDB client
    client = new MongoClient(mongoURL);

    // Connect to the MongoDB server
    await client.connect();

    // Read and insert cliente data from the e01_cliente TSV file
    const clienteFilePath = path.join(tsvDir, 'e01_cliente.tsv');
    const clienteDataArray = await readTSVFile(clienteFilePath);
    await insertClienteData(clienteDataArray, client);

    // Read and insert telefono data from the e01_telefono TSV file
    const telefonoFilePath = path.join(tsvDir, 'e01_telefono.tsv');
    const telefonoDataArray = await readTSVFile(telefonoFilePath);
    await insertTelefonosIntoClientes(telefonoDataArray, client);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (client) {
      // Close the MongoDB client
      client.close();
    }
  }
})();
